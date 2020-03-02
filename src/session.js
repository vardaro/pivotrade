const historical_data = require("./util/historical_data");
const round = require("./util/round");

const rootReducer = require("./reducers/index");
const actions = require("./actions/index");

const createStore = require("redux").createStore;

class Session {

  constructor(data) {
    this.store = createStore(rootReducer);

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

  /**
   * Simulates a buy
   * This function will not simulate a covering a short, shorting is delagated to a different, but similar, buy function.
   *
   * Sends payload to the action. The corresponding reducer opens a position and adds it to the state
   * Updates account value numbers and updates the state
   *
   * @param {object} payload
   */
  buy(payload) {
    if (!payload.quantity) throw Error("Order quantity required");

    if (!payload.limit) throw Error("Order limit is required");

    if (!payload.stop_loss) payload.stop_loss = 0;

    // Push position to the state
    let state = this.store.getState();
    payload.date = state.price.date;
    this.store.dispatch(actions.positions.open(payload));

    state = this.store.getState();
    let id = state.positions.recent;
    let position = state.positions.open[id];
    this.on_position_open(id)

    console.log(
      `${position.open_time} BUY ${position.quantity} ${state.settings.symbol} @ ${position.limit}. STOP ${position.stop_loss}. RISK ${position.risk}`
    );
  }

  /**
   * Simulates a sell.
   * This function will not simulate a short, shorting is delagated to a different, but similar, sell function.
   *
   * Sends payload to the action. The corresponding reducers closed the position on behalf of the user.
   * Updates P/L numbers accordingly, and updates the state.
   *
   * Updates account statistics
   * @param {object} payload
   */
  sell(payload) {
    if (!payload.id) throw Error("Position ID required");

    if (!payload.quantity) throw Error("Order quantity required");

    if (!payload.limit) throw Error("Order limit is required");

    let state = this.store.getState();

    // Update the state to close the position
    let position = state.positions.open[payload.id];
    payload.date = state.price.date;
    if (!position) throw Error("Invalid position ID");

    this.store.dispatch(actions.positions.close(payload));

    // Lot's of stuff changes when user closes position

    this.on_position_close(payload.id);

    console.log(
      `${position.close_time} SLL ${position.quantity} ${state.settings.symbol} @ ${payload.limit}. P/L ${position.realized_pl}\n`
    );
  }

  /**
   * Update cash on hand values upon opening of a position
   * @param {number} position_id 
   */
  on_position_open(position_id) {
    // Update cash on hand
    let state = this.store.getState();
    let position = state.positions.open[position_id];
    let money = {};
    money.capital = round(state.money.capital - position.cost_basis);

    this.store.dispatch(actions.money.update_money(money));
  }

  /**
   * Upon closing a position, update account value, cash on hand, realized p/l
   * Recompute strategy performance metrics
   *
   * Dispatch all changes to state
   * @param {Number} position_id
   */
  on_position_close(position_id) {
    // Update the account
    let state = this.store.getState();
    let position = state.positions.closed[position_id];
    let money = {};

    // Updated realized P/L
    money.realized_gain = round(
      state.money.realized_gain + position.realized_pl
    );

    // Capital = Capital + (close price * qty)
    money.capital = round(
      state.money.capital + position.quantity * position.close_price
    );

    this.store.dispatch(actions.money.update_money(money));

    // Update statistics
    state = this.store.getState();
    let stats = {
      num_trades: state.performance.num_trades + 1
    };

    if (position.realized_pl > 0) {
      stats.num_wins = state.performance.num_wins + 1;
      stats.biggest_profit = Math.max(
        state.performance.biggest_profit,
        position.realized_pl
      );
      stats.win_rate = round((stats.num_wins / stats.num_trades) * 100);
    } else {
      stats.num_losses = state.performance.num_losses + 1;
      stats.biggest_loss = Math.min(
        state.performance.biggest_loss,
        position.realized_pl
      );
    }

    stats.total_risk = state.performance.total_risk + position.risk;
    stats.average_risk_trade = round(stats.total_risk / stats.num_trades);

    stats.average_profit_trade = round(
      state.money.realized_gain / stats.num_trades
    );

    this.store.dispatch(actions.performance.update_performance(stats));
  }

  /**
   * Updates the states account value, depending on cash on hand and equitable assets.
   *
   * Recomputes unrealized P/L on open positions with newest price data.
   * Recompute ROI depending on new price data
   *
   */
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
        money.unrealized_gain =
          money.unrealized_gain + open[i].unrealized_profit_loss(cur_price);
      }
    }

    // Recompute total account values (V = Unrealized P/L + Cash)
    money.account_value = money.unrealized_gain + state.money.capital;

    // Recompute ROI
    money.roi = round(
      (state.money.realized_gain / state.money.initial_capital) * 100
    );

    this.store.dispatch(actions.money.update_money(money));
  }

  /**
   * If the user defined a stop loss, this function will
   * trigger the stop loss if the price reaches below support/above resistance.
   *
   * This closes the users position, incurring a loss.
   *
   * Only support's one stop loss currently.
   */
  trigger_stop_loss() {
    let state = this.store.getState();

    let cur_price = state.price.close;

    if (cur_price < state.positions.stop_losses) {
      let id = state.positions.recent;
      let position = state.positions.open[id];
      console.log(`Trigger Stop Loss: @ ${state.positions.stop_losses}`);

      this.sell({ id: id, quantity: position.quantity, limit: cur_price });
    }
  }

  /**
   * Simulates the users strategy on historical data.
   *
   * On each price tick, the user is presented with:
   * 1. Latest candle
   * 2. Current positions
   * 3. Account metadata
   * 4. Indicators
   * 5. Patterns
   *
   * The user leverages this information to determine when to open/exit positions
   * using session.buy and session.sell.
   *
   * @param {fn} strategy
   */
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

      // Check stop loss triggers
      this.trigger_stop_loss();

      state = this.store.getState();

      // Execute user's strategy
      let account = {
        positions: Object.values(state.positions.open),
        ...state.money
      };
      // console.log(state.indicators.values)
      strategy(state.price, account, state.indicators.values);
    }

    console.log(this.store.getState());
  }
}

module.exports = Session;
