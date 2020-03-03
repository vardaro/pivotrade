const Candlestick = require("../candlestick");

const initial_state = {
  open: 0.0,
  low: 0.0,
  high: 0.0,
  close: 0.0,
  volume: 0,
  date: ""
};

/**
 * Round's out price numbers to 2 digits, returns state
 * @param {obj} state
 * @param {obj} payload
 */
const tick = (state, payload) => {

  let candle = new Candlestick(
    payload.open,
    payload.high,
    payload.low,
    payload.close,
    payload.volume,
    payload.date
  );

  return Object.assign({}, state, candle);
};

const price = (state = initial_state, action) => {
  switch (action.type) {
    case "PRICE_TICK":
      return tick(state, action.payload);
    default:
      return state;
  }
};

module.exports = price;
