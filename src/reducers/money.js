const initial_state = {
  capital: 0.0,
  initial_capital: 0.0,
  account_value: 0.0,
  realized_gain: 0.0,
  unrealized_gain: 0.0,
  roi: 0.0
};

const money = (state = initial_state, action) => {
  switch (action.type) {
    case "UPDATE_MONEY":
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};

module.exports = money;
