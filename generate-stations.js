const fs = require('fs');
const path = require('path');

const stopsTxtPath = path.join(__dirname, 'src/assets/stops.txt');
const outputPath = path.join(__dirname, 'src/assets/stations.json');

function formatStopName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

fs.readFile(stopsTxtPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading stops.txt:', err);
    return;
  }

  const stationToStopIds = new Map();
  const lines = data.split('\n');

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');

    // stop_id,stop_name,...
    if (parts.length >= 2) {
      const stopId = parts[0];
      const stopName = formatStopName(parts[1]);

      if (!stationToStopIds.has(stopName)) {
        stationToStopIds.set(stopName, []);
      }
      stationToStopIds.get(stopName).push(stopId);
    }
  }

  const stations = Array.from(stationToStopIds.entries())
    .map(([name, ids]) => ({ name, ids }))
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFile(outputPath, JSON.stringify(stations, null, 2), (err) => {
    if (err) {
      console.error('Error writing stations.json:', err);
      return;
    }
    console.log('Successfully generated stations.json!');
  });
});
