const pool = require("../db");
const dijkstra = require("./dijkstra");

async function getNearestNode(cityId, lat, lon) {
  const query = `
        SELECT id, lat, lon
        FROM nodes
        WHERE city_id = $1
        ORDER BY ((lat- $2)^2 + (lon - $3)^2) ASC
        LIMIT 1
        `;
  const { rows } = await pool.query(query, [cityId, lat, lon]);
  return rows[0];
}

async function getNeighbors(cityId, nodeId) {
  const query = `
        SELECT to_node AS id, distance
        FROM edges
        WHERE city_id = $1 AND from_node = $2
        `;
  const { rows } = await pool.query(query, [cityId, nodeId]);
  return rows;
}

async function getNodesByIds(nodeIds) {
  const query = `
        SELECT id, lat, lon
        FROM nodes
        WHERE id = ANY($1)
        `;
  const { rows } = await pool.query(query, [nodeIds]);
  const map = {};
  rows.forEach((row) => {
    map[row.id] = row;
  });

  return nodeIds.map((id) => map[id]);
}

async function computePath(cityId, startLat, startLon, endLat, endLon) {
  const startNode = await getNearestNode(cityId, startLat, startLon);
  const endNode = await getNearestNode(cityId, endLat, endLon);

  const { path, distance } = await dijkstra(
    cityId,
    startNode.id,
    endNode.id,
    getNeighbors,
  );

  const nodeCoords = await getNodesByIds(path);
  return { distance, path: nodeCoords };
}

module.exports = {
  computePath,
};
