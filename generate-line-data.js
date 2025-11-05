const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const Papa = require('papaparse');

const GTFS_ZIP_PATH = path.join(__dirname, 'gtfs/gtfs_subway.zip');
const OUTPUT_DIR = path.join(__dirname, 'src/assets/lines');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Reading GTFS data from zip...');
const zip = new AdmZip(GTFS_ZIP_PATH);

const getParsedData = (fileName) => {
  const entry = zip.getEntry(fileName);
  if (!entry) {
    throw new Error(`File ${fileName} not found in zip archive.`);
  }
  const content = entry.getData().toString('utf8');
  return Papa.parse(content, { header: true, skipEmptyLines: true }).data;
};

console.log('Parsing GTFS files...');
const stops = getParsedData('stops.txt');
const trips = getParsedData('trips.txt');
const stopTimes = getParsedData('stop_times.txt');

console.log('Processing stops...');
const stopDetails = new Map();
const parentStations = new Map();

for (const stop of stops) {
  stopDetails.set(stop.stop_id, {
    name: stop.stop_name,
    parent: stop.parent_station || stop.stop_id,
  });
  if (!stop.parent_station) {
    parentStations.set(stop.stop_id, {
      name: stop.stop_name,
      stops: [],
    });
  }
}

for (const stop of stops) {
  if (stop.parent_station && parentStations.has(stop.parent_station)) {
    parentStations.get(stop.parent_station).stops.push(stop.stop_id);
  }
}

console.log('Processing trips and stop times...');
const tripsByRoute = new Map();
for (const trip of trips) {
  if (!tripsByRoute.has(trip.route_id)) {
    tripsByRoute.set(trip.route_id, []);
  }
  tripsByRoute.get(trip.route_id).push(trip.trip_id);
}

const stopTimesByTrip = new Map();
for (const stopTime of stopTimes) {
  if (!stopTimesByTrip.has(stopTime.trip_id)) {
    stopTimesByTrip.set(stopTime.trip_id, []);
  }
  stopTimesByTrip.get(stopTime.trip_id).push(stopTime);
}

// Sort stop times by sequence
for (const [tripId, times] of stopTimesByTrip.entries()) {
  times.sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));
}

console.log('Generating line data...');
const lineData = new Map();

for (const [routeId, tripIds] of tripsByRoute.entries()) {
  const stopSequences = new Map();
  let maxStops = 0;
  let localTripPattern = '';

  // Find the trip pattern with the most stops, which we assume is the local service.
  for (const tripId of tripIds) {
    const sequence = stopTimesByTrip
      .get(tripId)
      ?.map((st) => stopDetails.get(st.stop_id)?.parent)
      .filter(Boolean)
      .join(',');

    if (sequence) {
      stopSequences.set(sequence, (stopSequences.get(sequence) || 0) + 1);
      if (sequence.split(',').length > maxStops) {
        maxStops = sequence.split(',').length;
        localTripPattern = sequence;
      }
    }
  }

  if (!localTripPattern) continue;

  const localStops = [...new Set(localTripPattern.split(','))];
  const expressStops = new Set();

  // Any stop on a trip pattern that is SHORTER than the local pattern is considered an express stop.
  for (const sequence of stopSequences.keys()) {
    if (sequence.split(',').length < localStops.length) {
      for (const stop of sequence.split(',')) {
        expressStops.add(stop);
      }
    }
  }

  const stations = localStops.map((parentStationId) => {
    const stationInfo = parentStations.get(parentStationId);
    const stationStops = stationInfo ? stationInfo.stops : [parentStationId];

    return {
      stationId: parentStationId,
      name: stationInfo ? stationInfo.name : stopDetails.get(parentStationId)?.name,
      stops: stationStops.reduce((acc, stopId) => {
        const dir = stopId.slice(-1);
        if (dir === 'N' || dir === 'S') {
          if (!acc[dir]) acc[dir] = [];
          acc[dir].push(stopId);
        }
        return acc;
      }, {}),
      // A stop is express if it's part of a shorter (express) service pattern.
      isExpress: expressStops.has(parentStationId),
    };
  });

  lineData.set(routeId, stations);
}

console.log('Writing JSON files...');
for (const [routeId, stations] of lineData.entries()) {
  // Aliases for shuttles
  const finalRouteId = routeId === 'GS' ? 'S' : routeId;
  const filePath = path.join(OUTPUT_DIR, `${finalRouteId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(stations, null, 2));
  console.log(`- Wrote ${filePath}`);
}

console.log('Done.');
