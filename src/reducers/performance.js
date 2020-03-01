const initial_state = {
    num_ticks: 0.0,
    win_rate: 0.0,
    num_wins: 0.0,
    num_losses: 0.0,
    num_trades: 0.0,
    buy_and_hold_potential: 0.0,
    buy_and_hold_gain: 0.0,
    biggest_loss: 0.0,
    biggest_profit: 0.0,
    average_profit_trade: 0.0,
    average_risk_trade: 0.0
}

const performance = (state=initial_state, action) => {
    switch (action.type) {
      case "UPDATE_PERFORMANCE":
        return Object.assign({}, state, action.payload);
      default:
        return state;
    }
  };
  
  module.exports =  performance;
  