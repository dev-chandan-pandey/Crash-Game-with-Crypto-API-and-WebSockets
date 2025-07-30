// models/Bet.js
const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  amountUSD: { type: Number, required: true },
  cashOutMultiplier: { type: Number }, 
  status: {
    type: String,
    enum: ["pending", "cashed_out", "lost"],
    default: "pending",
  },
   payoutUSD: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bet", betSchema);
