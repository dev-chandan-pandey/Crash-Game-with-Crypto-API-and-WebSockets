// controllers/betController.js
const { emitToUser } = require("../websocket/socketManager");

const User = require("../models/User");
const Game = require("../models/GameRound");
const Bet = require("../models/Bet");
const Wallet = require("../models/Wallet");
exports.cashOut = async (req, res) => {
  try {
    const { betId, currentMultiplier } = req.body;

    const bet = await Bet.findById(betId).populate("user");
    if (!bet) return res.status(404).json({ message: "Bet not found" });

    if (bet.status !== "pending") {
      return res.status(400).json({ message: "Bet already settled" });
    }

    const game = await Game.findById(bet.game);
    if (!game || game.status !== "active") {
      return res.status(400).json({ message: "Game not active" });
    }

    const payout = bet.amountUSD * currentMultiplier;

    // Update bet
    bet.status = "cashed_out";
    bet.cashOutMultiplier = currentMultiplier;
    bet.payoutUSD = payout;
    await bet.save();

    // Update wallet
    const wallet = await Wallet.findOne({ user: bet.user._id });
    wallet.usd += payout;
    await wallet.save();

    // Emit to user
    emitToUser(bet.user.socketId, {
      type: "CASHED_OUT",
      betId: bet._id,
      payoutUSD: payout,
      multiplier: currentMultiplier,
    });

    res.status(200).json({ message: "Cashed out", bet });
  } catch (err) {
    console.error("Cashout Error:", err);
    res.status(500).json({ message: "Failed to cash out" });
  }
};
exports.placeBet = async (req, res) => {
  try {
    const { username, gameId, amountUSD } = req.body;

    // Validate user and wallet
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet || wallet.usd < amountUSD)
      return res.status(400).json({ message: "Insufficient funds" });

    const game = await Game.findById(gameId);
    if (!game || game.status !== "active")
      return res.status(400).json({ message: "Invalid or ended game" });

    // Deduct USD
    wallet.usd -= amountUSD;
    await wallet.save();

    const bet = await Bet.create({
      user: user._id,
      game: game._id,
      amountUSD,
    });
 
    res.status(201).json({ message: "Bet placed", bet });
  } catch (err) {
    console.error("Place Bet Error:", err);
    res.status(500).json({ message: "Failed to place bet" });
  }
};

