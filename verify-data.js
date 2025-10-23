const fs = require('fs');
const { transit_realtime } = require('gtfs-realtime-bindings');
const Long = require('long');

async function main() {
  const { default: fetch } = await import('node-fetch');

  const feedUrls = [
    'http://localhost:5000/api/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
    'http://localhost:5000/api/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
    'http://localhost:5000/api/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  ];

  const allArrivalTimes = [];

  for (const url of feedUrls) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    console.log(`Received buffer from ${url}, length: ${buffer.byteLength}`);
    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const updates = [];
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate) {
        entity.tripUpdate.stopTimeUpdate?.forEach((update) => {
          const arrivalTime = update.arrival?.time;
          const departureTime = update.departure?.time;

          const timesSquareStops = ['R16', '127', '725', '902'];

          if (update.stopId && timesSquareStops.some(stop => update.stopId?.startsWith(stop))) {
            updates.push({
              stopId: update.stopId,
              arrival: convertToNumber(arrivalTime),
              departure: convertToNumber(departureTime)
            });
          }
        });
      }
    });
    allArrivalTimes.push(...updates);
  }

  fs.writeFileSync('arrival-times.json', JSON.stringify(allArrivalTimes, null, 2));
}

function convertToNumber(value) {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'number') {
    return value;
  }
  return new Long(value.low, value.high, value.unsigned).toNumber();
}

main();
