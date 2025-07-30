// models/Game.js
const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  cryptoType: { type: String, enum: ["BTC", "ETH"], required: true },
  startTime: { type: Date, default: Date.now },
  crashMultiplier: { type: Number, required: true },
  status: { type: String, enum: ["active", "crashed"], default: "active" },
});

module.exports = mongoose.model("Game", gameSchema);
