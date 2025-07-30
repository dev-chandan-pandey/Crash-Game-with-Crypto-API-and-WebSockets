const Wallet = require("../models/Wallet");
const User = require("../models/User");
const getPrice = require("../services/cryptoService");

exports.getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Find user by username
    const user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Step 2: Find wallet by user ID
    const wallet = await Wallet.findOne({ user: user._id }).populate("user");
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Step 3: Get live prices
    const prices = await getPrice(); // { BTC: ..., ETH: ... }

    // Step 4: Calculate USD value
    const usdEquivalent = {
      BTC: wallet.balances.BTC * prices.BTC,
      ETH: wallet.balances.ETH * prices.ETH,
    };

    // Step 5: Respond with data
    res.json({
      user: wallet.user.username,
      balances: wallet.balances,
      usdEquivalent,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching wallet", error: err.message });
  }
};

