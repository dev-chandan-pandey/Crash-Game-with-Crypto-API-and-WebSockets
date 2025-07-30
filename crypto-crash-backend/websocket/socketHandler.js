const { getCurrentGameState } = require("./gameState");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
async function handleCashout(socket, data) {
  console.log("📥 Entered handleCashout with data:", data);
  const { userId, gameId } = data;
  const { currentGameId, currentMultiplier } = getCurrentGameState();
  if (!userId || !gameId) {
    return socket.emit("cashout_failed", {
      message: "Invalid user or game data",
    });
  }
  console.log("🧾 Manual cashout requested by user:", userId);
  console.log("🎯 Current Game ID:", currentGameId);
  console.log("📈 Current Multiplier:", currentMultiplier);
  try {
    const bet = await Bet.findOne({
      user: userId,
      game: gameId,
      status: "pending",
    });
    if (!bet) {
      console.log("❌ No pending bet found");
      return socket.emit("cashout_failed", { message: "No active bet found" });
    }
    const user = await User.findById(userId).populate("wallet");
    if (!user || !user.wallet || !user.wallet.balances || typeof user.wallet.balances.BTC !== "number") {
      console.log("❌ Wallet structure invalid");
      return socket.emit("cashout_failed", { message: "User wallet not found or invalid" });
    }
    const amountUSD = bet.amountUSD ?? 0;
    const multiplier = parseFloat(currentMultiplier ?? 1);
    const cashOutAmount = amountUSD * multiplier;
    if (!cashOutAmount || isNaN(cashOutAmount)) {
      console.log("❌ Cashout amount invalid");
      return socket.emit("cashout_failed", {
        message: "Invalid cashout calculation",
      });
    }
    // Update bet
    bet.status = "cashed_out";
    bet.cashOutMultiplier = multiplier;
    bet.payout = cashOutAmount;
    await bet.save();
    // Update wallet's BTC balance
    user.wallet.balances.BTC = parseFloat((user.wallet.balances.BTC + cashOutAmount).toFixed(8));
    await user.wallet.save();
    socket.emit("cashout_success", {
      payout: cashOutAmount,
      cashOutMultiplier: multiplier,
      gameId: currentGameId,
    });
    console.log(`✅ Bet ${bet._id} cashed out at ${multiplier}x for $${cashOutAmount}`);
  } catch (error) {
    console.error("❌ Error in handleCashout:", error.message);
    socket.emit("cashout_failed", { message: "Internal server error" });
  }
}

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("🟢 WebSocket connected:", socket.id);
    socket.on("cashout", (data) => {
      handleCashout(socket, data);
    });
  });
}
module.exports = {
  socketHandler,
};
