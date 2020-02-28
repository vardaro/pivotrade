const yahoo = require("yahoo-finance");

const historical_data = async (symbol, start, end, period) => {
  let data = await yahoo.historical({
    symbol: symbol,
    from: start,
    to: end,
    period: period
  });
  data.reverse();
  
  return data;
};

module.exports = historical_data;
