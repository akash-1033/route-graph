const graphService = require("../services/graph.service");

exports.findPath = async (req, res) => {
  try {
    const { cityId, start, end } = req.body;

    if (!cityId || !start || !end) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const results = await graphService.computePath(
      cityId,
      start.lat,
      start.lon,
      end.lat,
      end.lon,
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
