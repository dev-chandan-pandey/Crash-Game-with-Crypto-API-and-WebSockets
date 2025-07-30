const express = require("express");
const router = express.Router();
const { getWallet } = require("../controllers/walletController");
router.get("/:userId", getWallet);
module.exports = router;
