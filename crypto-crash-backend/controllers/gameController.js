// controllers/gameController.js
const Game = require("../models/GameRound");

function generateCrashMultiplier() {
  const r = Math.random();
  return Math.max(1.0, parseFloat((1 / r).toFixed(2))); // example crash logic
}

exports.startGame = async (req, res) => {
  try {
    const { cryptoType } = req.body;
    const crashMultiplier = generateCrashMultiplier();

    const game = await Game.create({ cryptoType, crashMultiplier });

    res.status(201).json({ message: "Game started", game });
  } catch (error) {
    console.error("Start Game Error:", error);
    res.status(500).json({ message: "Failed to start game" });
  }
};
