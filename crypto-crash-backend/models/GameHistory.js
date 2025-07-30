const mongoose = require("mongoose");

const gameHistorySchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CrashGame",
    required: true,
  },
  crashPoint: {
    type: Number,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  endedAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("GameHistory", gameHistorySchema);
