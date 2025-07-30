const express = require("express");
const router = express.Router();
const GameHistory = require("../models/GameHistory");
// Get last 20 games
router.get("/recent", async (req, res) => {
  try {
    const history = await GameHistory.find()
      .sort({ startedAt: -1 })
      .limit(20);
    res.json({ success: true, history });
  } catch (err) {
    console.error("Failed to fetch game history:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
module.exports = router;
