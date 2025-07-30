const Bet = require("../models/Bet");
const User = require("../models/User");

exports.getTopUsersLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Bet.aggregate([
      {
        $match: {
          status: { $in: ["won", "cashed_out"] },
        },
      },
      {
        $group: {
          _id: "$user",
          totalWinnings: { $sum: "$payout" },
          totalBets: { $sum: 1 },
        },
      },
      {
        $sort: { totalWinnings: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          username: "$userInfo.username",
          totalWinnings: 1,
          totalBets: 1,
        },
      },
    ]);

    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error("❌ Leaderboard error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
};
