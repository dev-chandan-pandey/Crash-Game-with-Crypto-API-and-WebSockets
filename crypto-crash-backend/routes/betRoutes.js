// routes/betRoutes.js
const express = require("express");
const { placeBet } = require("../controllers/betController");
const { cashOut } = require("../controllers/betController");
const router = express.Router();
router.post("/place", placeBet);
router.post("/cashout", cashOut);
module.exports = router;
