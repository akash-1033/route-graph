module.exports = async function dijkstra(cityId, startId, endId, getNeighbors) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const pq = [];

  distances[startId] = 0;
  pq.push({ id: startId, dist: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => {
      return a.dist - b.dist;
    });
    const current = pq.shift();
    const currentId = current.id;
    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    if (currentId === endId) {
      break;
    }
    const neighbors = await getNeighbors(cityId, currentId);
    for (const neighbor of neighbors) {
      const newDist = distances[currentId] + neighbor.distance;

      if (
        distances[neighbor.id] === undefined ||
        newDist < distances[neighbor.id]
      ) {
        distances[neighbor.id] = newDist;
        previous[neighbor.id] = currentId;
        pq.push({ id: neighbor.id, dist: newDist });
      }
    }
  }

  const path = [];
  let current = endId;

  while (current !== undefined) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    path,
    distance: distances[endId],
  };
};
