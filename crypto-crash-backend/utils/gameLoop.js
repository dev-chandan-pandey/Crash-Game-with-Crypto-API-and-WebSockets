
const GameHistory = require("../models/GameHistory");
const Game = require("../models/GameRound");
const Bet = require("../models/Bet");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const { emitToAll, emitToUser } = require("../websocket/socketManager");
const { setCurrentGameState } = require("../websocket/gameState");
let currentGameId = null;
let currentMultiplier = 1.0;
let crashPoint = null;
let intervalId = null;

function generateCrashPoint() {
  return parseFloat((Math.random() * (5 - 1.5) + 1.5).toFixed(2));
}

function generateCrashMultiplier() {
  const r = Math.random();
  return Math.max(1.01, (1 / (1 - r)).toFixed(2));
}

async function resolveBets(game, crashPoint) {
  try {
    const bets = await Bet.find({ game: game._id, status: "pending" });

    for (const bet of bets) {
      const user = await User.findById(bet.user).populate("wallet");
      if (!user || !user.wallet) continue;

      let payout = 0;
      let status = "lost";

      if (bet.cashOutMultiplier <= crashPoint) {
        payout = bet.amount * bet.cashOutMultiplier;
        status = "won";

        user.wallet.balance += payout;
        await user.wallet.save();
      }

      bet.status = status;
      bet.payout = payout;
      await bet.save();

      emitToUser(user.socketId, {
        type: "BET_RESULT",
        status,
        payout,
        crashPoint,
        gameId: game._id,
      });
    }

    console.log(`✅ Resolved ${bets.length} bets for game ${game._id}`);
  } catch (error) {
    console.error("❌ Error resolving bets:", error.message);
  }
}

async function gameLoop() {
  while (true) {
    console.log("🔁 Starting new game...");

    crashPoint = generateCrashPoint();
    const crashMultiplier = generateCrashMultiplier();

    const game = new Game({
      cryptoType: "BTC",
      status: "active",
      crashPoint,
      startTime: new Date(),
      crashMultiplier,
    });

    try {
      await game.save();
      currentGameId = game._id.toString();
      setCurrentGameState( currentGameId, currentMultiplier, crashPoint);
    } catch (err) {
      console.error("❌ Error saving game:", err);
      await new Promise((res) => setTimeout(res, 5000));
      continue;
    }

    for (let i = 5; i > 0; i--) {
      emitToAll("countdown", { seconds: i });
      await new Promise((res) => setTimeout(res, 1000));
    }

    emitToAll("game_start", {
      gameId: game._id,
      crashAt: crashPoint,
    });

    console.log(`🚀 Game #${game._id} running... Crash at ${crashPoint}x`);
    currentMultiplier = 1.0;

    await new Promise((resolve) => {
      intervalId = setInterval(async () => {
        currentMultiplier += 0.01;
        currentMultiplier = parseFloat(currentMultiplier.toFixed(2));
setCurrentGameState({
  currentGameId: game._id.toString(),
  currentMultiplier,
  crashPoint,
});
        emitToAll("multiplier", { multiplier: currentMultiplier });

        const autoCashoutBets = await Bet.find({
          game: game._id,
          status: "pending",
          cashOutMultiplier: { $lte: currentMultiplier },
        });

        for (const bet of autoCashoutBets) {
          const user = await User.findById(bet.user).populate("wallet");
          // if (!user || !user.wallet) continue;
if (!user || !user.wallet) {
  console.error("User or wallet not found", user);
  return socket.emit("cashout_failed", { message: "User wallet not found" });
}

          const cashOutAmount = bet.amount * bet.cashOutMultiplier;

          bet.status = "cashed_out";
          bet.payout = cashOutAmount;
          await bet.save();

          user.wallet.balance += cashOutAmount;
          await user.wallet.save();

          emitToUser(user.socketId, {
            type: "AUTO_CASHOUT",
            multiplier: currentMultiplier,
            payout: cashOutAmount,
            betId: bet._id,
          });

          console.log(`💸 Auto-cashed out bet ${bet._id} at ${currentMultiplier}x`);
        }

        if (currentMultiplier >= crashPoint) {
          clearInterval(intervalId);

          await Game.findByIdAndUpdate(game._id, {
            status: "ended",
            crashMultiplier: crashPoint,
          });

          emitToAll("crash", { crashPoint });

          await resolveBets(game, crashPoint);

          await GameHistory.create({
            gameId: game._id,
            cryptoType: game.cryptoType,
            crashPoint: crashPoint,
            startedAt: game.startTime,
            endedAt: new Date(),
          });

          console.log(`📜 Game history saved for game ${game._id}`);
          resolve();
        }
      }, 100);
    });

    await new Promise((res) => setTimeout(res, 5000));
  }
}
 module.exports = gameLoop;