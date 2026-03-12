const MinHeap = require("../utils/minHeap");
const { edgeCache, nodeCache } = require("./graph.service");

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = async function aStar(startId, endId) {
  const startTimer = performance.now();
  const endNode = nodeCache.get(endId);
  if (!endNode) throw new Error("Destination node not found in cache");

  const distances = new Map();
  const previous = new Map();
  const pq = new MinHeap();

  distances.set(startId, 0);
  pq.push({ id: startId, priority: 0 });

  while (pq.size() > 0) {
    const { id: currentId } = pq.pop();
    if (currentId === endId) break;

    const neighbors = edgeCache.get(currentId) || [];
    for (const neighbor of neighbors) {
      const newDist = distances.get(currentId) + neighbor.distance;

      if (!distances.has(neighbor.id) || newDist < distances.get(neighbor.id)) {
        const neighborData = nodeCache.get(neighbor.id);
        if (!neighborData) continue;

        distances.set(neighbor.id, newDist);
        previous.set(neighbor.id, currentId);

        const h = haversine(
          neighborData.lat,
          neighborData.lon,
          endNode.lat,
          endNode.lon,
        );
        pq.push({ id: neighbor.id, priority: newDist + h });
      }
    }
  }

  if (!distances.has(endId)) return { path: [], distance: 0 };

  let path = [];
  let curr = endId;
  while (curr) {
    const coords = nodeCache.get(curr);
    if (!coords) break;
    path.push({ id: curr, ...coords });
    if (curr === startId) break;
    curr = previous.get(curr);
  }

  const endTimer = performance.now();
  console.log(`Pure Search Time: ${(endTimer - startTimer).toFixed(2)}ms`);
  return {
    path: path.reverse(),
    distance: parseFloat(distances.get(endId).toFixed(2)),
  };
};
