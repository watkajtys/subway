const fs = require('fs');
const path = require('path');

const stopsTxtPath = path.join(__dirname, 'src/assets/stops.txt');
const transfersTxtPath = path.join(__dirname, 'src/assets/transfers.txt');
const linesDir = path.join(__dirname, 'src/assets/lines');
const outputPath = path.join(__dirname, 'src/assets/stations.json');

function formatStopName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to read CSV files
function readCsv(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n');
  const headers = lines[0].trim().split(',');
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields if necessary, but standard GTFS usually simple CSV
    // A simple split matches the current logic
    const parts = line.split(',');
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = parts[j];
    }
    result.push(obj);
  }
  return result;
}

// 1. Build Stop ID -> Lines mapping
console.log('Building Stop -> Lines mapping...');
const stopToLines = new Map(); // stopId -> Set<lineId>

const lineFiles = fs.readdirSync(linesDir);
for (const file of lineFiles) {
  if (!file.endsWith('.json')) continue;

  // Extract line name (e.g., "1_weekday.json" -> "1", "6X_weekday.json" -> "6X")
  const lineName = file.split('_')[0];

  const content = JSON.parse(fs.readFileSync(path.join(linesDir, file), 'utf8'));
  for (const station of content) {
    if (station.stationId) {
      if (!stopToLines.has(station.stationId)) {
        stopToLines.set(station.stationId, new Set());
      }
      stopToLines.get(station.stationId).add(lineName);
    }
  }
}

// 2. Build Transfer Graph
console.log('Building Transfer Graph...');
const transfers = readCsv(transfersTxtPath);
const adjacencyList = new Map(); // stopId -> Set<stopId>

function addEdge(u, v) {
  if (!adjacencyList.has(u)) adjacencyList.set(u, new Set());
  if (!adjacencyList.has(v)) adjacencyList.set(v, new Set());
  adjacencyList.get(u).add(v);
  adjacencyList.get(v).add(u);
}

for (const t of transfers) {
  const from = t.from_stop_id;
  const to = t.to_stop_id;
  // Only consider transfers between different stops
  if (from !== to) {
    addEdge(from, to);
  }
}

// 3. Read Stops and Group into Complexes
console.log('Grouping Stops into Complexes...');
const stops = readCsv(stopsTxtPath);
const stopMap = new Map(); // stopId -> stopData
for (const s of stops) {
  stopMap.set(s.stop_id, s);
}

const visited = new Set();
const complexes = [];

for (const s of stops) {
  const stopId = s.stop_id;

  // We only want to start grouping from parent stations.
  // If a stop has a parent_station ID, it is a child node (e.g., platform).
  // We skip it here because it will be included when we process its parent
  // (or implicitly if we were using parent-child links, but here we do it in Step 4).
  // IMPORTANT: If we don't skip child nodes here, they will be treated as separate, unconnected stations
  // because transfers.txt typically only links parents, leaving children isolated in the graph.
  if (s.parent_station) continue;

  if (visited.has(stopId)) continue;

  // Start a new complex
  const complexIds = new Set();
  const queue = [stopId];
  visited.add(stopId);

  let primaryName = formatStopName(s.stop_name);

  while (queue.length > 0) {
    const currentId = queue.shift();
    complexIds.add(currentId);

    // Check neighbors
    if (adjacencyList.has(currentId)) {
      for (const neighbor of adjacencyList.get(currentId)) {
        if (!visited.has(neighbor) && stopMap.has(neighbor)) {
            // Only visit if it's a known stop in our stops.txt
            visited.add(neighbor);
            queue.push(neighbor);
        }
      }
    }
  }

  // Collect all lines serving this complex
  const lines = new Set();
  for (const id of complexIds) {
      if (stopToLines.has(id)) {
          for (const line of stopToLines.get(id)) {
              lines.add(line);
          }
      }
  }

  complexes.push({
    name: primaryName,
    ids: Array.from(complexIds),
    lines: Array.from(lines).sort() // Sort alphanumerically: 1, 2, A, B...
  });
}

// 4. Expand complexes to include child stops
// The initial grouping only included stops that were directly traversed (parents).
// We need to ensure all child stops (N/S) are included in the 'ids' list.
const parentToChildren = new Map();
for (const s of stops) {
  if (s.parent_station) {
    if (!parentToChildren.has(s.parent_station)) {
      parentToChildren.set(s.parent_station, []);
    }
    parentToChildren.get(s.parent_station).push(s.stop_id);
  }
}

for (const complex of complexes) {
  const parentIds = [...complex.ids];
  for (const pid of parentIds) {
    if (parentToChildren.has(pid)) {
      complex.ids.push(...parentToChildren.get(pid));
    }
  }
}


// 5. Disambiguate Names
console.log('Disambiguating Names...');
const nameCounts = new Map();
for (const c of complexes) {
  nameCounts.set(c.name, (nameCounts.get(c.name) || 0) + 1);
}

const finalStations = complexes.map(c => {
  let finalName = c.name;
  if (nameCounts.get(c.name) > 1) {
    // Collision detected! Append lines.
    if (c.lines.length > 0) {
        // Special handling: The user asked for "86 St (4, 5, 6)".
        // We join with ", ".
        finalName = `${c.name} (${c.lines.join(', ')})`;
    }
  }

  return {
    name: finalName,
    ids: c.ids
  };
}).sort((a, b) => a.name.localeCompare(b.name));

// 6. Write Output
fs.writeFile(outputPath, JSON.stringify(finalStations, null, 2), (err) => {
  if (err) {
    console.error('Error writing stations.json:', err);
    return;
  }
  console.log('Successfully generated stations.json with complex grouping!');
});
