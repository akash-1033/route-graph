const pool = require("../db");

let edgeCache = new Map();
let nodeCache = new Map();

async function loadGraphIntoMemory(cityId) {
  console.log(`Loading graph for city ${cityId} into RAM...`);
  const start = Date.now();

  try {
    const edgeRes = await pool.query(
      "SELECT from_node, to_node, distance FROM edges WHERE city_id = $1",
      [cityId],
    );

    edgeRes.rows.forEach((e) => {
      if (!edgeCache.has(e.from_node)) edgeCache.set(e.from_node, []);
      edgeCache
        .get(e.from_node)
        .push({ id: e.to_node, distance: parseFloat(e.distance) });
    });

    const nodeRes = await pool.query(
      "SELECT id, lat, lon FROM nodes WHERE city_id = $1",
      [cityId],
    );

    nodeRes.rows.forEach((n) => {
      nodeCache.set(n.id, { lat: parseFloat(n.lat), lon: parseFloat(n.lon) });
    });

    const end = Date.now();
    console.log(
      `Graph Loaded: ${nodeCache.size} nodes, ${edgeRes.rowCount} edges in ${end - start}ms`,
    );
  } catch (err) {
    console.error("Failed to load graph into memory:", err.message);
  }
}

async function getNearestNode(cityId, lat, lon) {
  const query = `
        SELECT id FROM nodes 
        WHERE city_id = $1 
        AND lat BETWEEN $2 - 0.05 AND $2 + 0.05 
        AND lon BETWEEN $3 - 0.05 AND $3 + 0.05
        ORDER BY ((lat - $2)^2 + (lon - $3)^2) ASC 
        LIMIT 1
        `;
  const { rows } = await pool.query(query, [cityId, lat, lon]);
  return rows.length > 0 ? rows[0].id : null;
}

module.exports = {
  loadGraphIntoMemory,
  getNearestNode,
  edgeCache,
  nodeCache,
};
