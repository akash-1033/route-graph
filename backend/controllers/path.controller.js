const graphService = require("../services/graph.service");
const aStar = require("../services/aStar");

exports.findPath = async (req, res) => {
  try {
    const { cityId, start, end } = req.body;

    if (!cityId || !start || !end) {
      return res.status(400).json({ message: "Missing required parameters" });
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
        .json({ message: "Location outside of road network." });
    }

    const results = await aStar(startId, endId);

    if (!results.path || results.path.length === 0) {
      return res
        .status(404)
        .json({ message: "No path found between these points." });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
