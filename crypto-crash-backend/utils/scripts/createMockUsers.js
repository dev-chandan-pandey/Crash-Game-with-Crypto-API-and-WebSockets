
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../../models/User.js";
import Wallet from "../../models/Wallet.js";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const users = [
  { username: "alice" },
  { username: "bob" },
  { username: "chandan" },
];
async function seed() {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany();
  await Wallet.deleteMany();
  for (const u of users) {
    const user = await User.create({ username: u.username });
    const wallet = await Wallet.create({
      user: user._id,
      balances: {
        BTC: 0.002, 
        ETH: 0.05,
      },
    });
    user.wallet = wallet._id;
    await user.save();
    console.log(`Created user ${u.username}`);
  }
  console.log("✅ Mock users inserted");
  process.exit();
}
seed();
