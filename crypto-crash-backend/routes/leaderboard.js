const express = require('express');
const router = express.Router();
const { getTopUsersLeaderboard } = require('../controllers/leaderboardController');
router.get('/top', getTopUsersLeaderboard);
module.exports = router;
