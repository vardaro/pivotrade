const Position = require("./position");
const historical_data = require("./util/historical_data");
const round = require("./util/round");

const rootReducer = require("./reducers/index");
const actions = require("./actions/index");

const createStore = require("redux").createStore;

// const store = createStore(rootReducer);

class Session {
  store = createStore(rootReducer);

  constructor(data) {
    const settings = {};
    const money = {};
    const indicators = {};

    // Update user settings
    if (data.name) settings.name = data.name;

    if (data.start_date) settings.start_date = data.start_date;

    if (data.end_date) settings.end_date = data.end_date;

    if (data.period) settings.period = data.period;

    if (data.symbol) settings.symbol = data.symbol;
    else throw Error("A ticker is required");

    this.store.dispatch(actions.settings.update_settings(settings));

    // Update the users accounts
    if (data.capital) {
      money.capital = round(data.capital);
      money.initial_capital = money.capital;
      money.account_value = money.capital;
    } else {
      throw Error("Capital required");
    }

    this.store.dispatch(actions.money.update_money(money));

    // Update the users indicators
    if (data.indicators) indicators.list = Object.entries(data.indicators);

    this.store.dispatch(actions.indicators.set_indicators(indicators));
  }

  buy(payload) {
    if (!payload.quantity) throw Error("Order quantity required");

    if (!payload.limit) throw Error("Order limit is required");

    // Push position to the state
    let state = this.store.getState();
    payload.date = state.price.date;
    this.store.dispatch(actions.positions.open(payload));

    // Update cash on hand
    state = this.store.getState();
    let position_id = state.positions.recent;
    let position = state.positions.open[position_id];
    let money = {};
    money.capital = round(state.money.capital - position.cost_basis);

    this.store.dispatch(actions.money.update_money(money));

    console.log(
      `${position.open_time} BUY ${position.quantity} ${state.settings.symbol} @ ${position.limit}  - STOP ${position.stop_loss}`
    );
  }

  sell(payload) {
    if (!payload.id) throw Error("Position ID required");

    if (!payload.quantity) throw Error("Order quantity required");

    if (!payload.limit) throw Error("Order limit is required");

    let state = this.store.getState();

    let position = state.positions.open[payload.id];
    payload.date = state.price.date;
    if (!position) throw Error("Invalid position ID");

    this.store.dispatch(actions.positions.close(payload));

    let money = {}
    // Updated realized P/L
    money.realized_gain = round(state.money.realized_gain + position.realized_pl);

    // Capital = Capital + (price * qty)
    money.capital = round(state.money.capital + (position.quantity * payload.limit));

    this.store.dispatch(actions.money.update_money(money));

    console.log(
      `${position.close_time} SLL ${position.quantity} ${state.settings.symbol} @ ${payload.limit}`
    );
  }

  update_account() {
    let state = this.store.getState();

    let cur_price = state.price.close;
    let open = Object.values(state.positions.open);

    
    let money = {
      unrealized_gain: 0.0,
      account_value: 0.0,
      roi: 0.0
    };

    // Recompute unrealized P/L
    if (open.length) {
      for (let i = 0; i < open.length; i++) {
        money.unrealized_gain = money.unrealized_gain + open[i].unrealized_profit_loss(cur_price);
      }
    }

    // Recompute total account values (V = Unrealized P/L + Cash)
    money.account_value = money.unrealized_gain + state.money.capital;

    // Recompute ROI
    money.roi = (state.money.realized_gain / state.money.initial_capital) * 100;

    this.store.dispatch(actions.money.update_money(money));

  }

  async backtest(strategy) {
    if (typeof strategy !== "function") {
      throw Error("Strategy must be a function");
      return;
    }

    let state = this.store.getState();
    let ohlcv = await historical_data(
      state.settings.symbol,
      state.settings.start_date,
      state.settings.end_date,
      state.settings.period
    );

    for (let i = 0; i < ohlcv.length; i++) {
      let price = ohlcv[i];

      this.store.dispatch(actions.price.tick(price));

      // Update indicators
      this.store.dispatch(actions.indicators.update_indicators(price));

      // Update account
      this.update_account();

      state = this.store.getState();

      // Execute user's strategy
      let account = {
        positions: Object.values(state.positions.open),
        ...state.money
      };
      strategy(state.price, account, state.indicators.values);
    }

    console.log(this.store.getState());
  }
}

module.exports = Session;
