// websocket/gameState.js
let currentGameId = null;
let currentMultiplier = 1.0;
let crashPoint = null;

module.exports = {
  getCurrentGameState: () => ({ currentGameId, currentMultiplier, crashPoint }),
  setCurrentGameState: (state) => {
    currentGameId = state.currentGameId;
    currentMultiplier = state.currentMultiplier;
    crashPoint = state.crashPoint;
  },
};
