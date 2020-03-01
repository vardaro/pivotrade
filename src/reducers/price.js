const round = require('../util/round'); 

const initial_state = {
  open: 0.0,
  low: 0.0,
  high: 0.0,
  close: 0.0,
  volume: 0,
  date: ""
};

const tick = (state, payload) => {
  let data = {};

  data.low = round(payload.low);
  data.high = round(payload.high);
  data.open = round(payload.open);
  data.close = round(payload.close);
  data.date = payload.date;
  data.volume = payload.volume;

  return Object.assign({}, state, data);
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
