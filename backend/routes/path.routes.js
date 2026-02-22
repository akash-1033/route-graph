const express = require("express");
const { findPath } = require("../controllers/path.controller");

const router = express.Router();

router.post("/path", findPath);

module.exports = router;
