const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
 wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }
});

module.exports = mongoose.model("User", userSchema);
