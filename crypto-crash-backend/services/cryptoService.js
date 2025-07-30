const axios = require("axios");

let cache = null;
let lastFetch = 0;

const getPrice = async () => {
  const now = Date.now();
  if (cache && now - lastFetch < 10000) return cache;

  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
  );

  cache = {
    BTC: res.data.bitcoin.usd,
    ETH: res.data.ethereum.usd,
  };
  lastFetch = now;
  return cache;
};

module.exports = getPrice;
