const graphService = require("../services/graph.service");
const aStar = require("../services/aStar");

exports.findPath = async (req, res) => {
  try {
    const { cityId, start, end } = req.body;

    if (!cityId || !start || !end) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const startId = await graphService.getNearestNode(
      cityId,
      start.lat,
      start.lon,
    );
    const endId = await graphService.getNearestNode(cityId, end.lat, end.lon);

    if (!startId || !endId) {
      return res
        .status(404)
        .json({ error: "Start or End location outside of road network." });
    }

    const results = await aStar(startId, endId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
