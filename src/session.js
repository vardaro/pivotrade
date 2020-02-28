const Position = require("./position");
const historical_data = require("./util/historical_data");

class Session {
  #name = "";
  #symbol = "";
  #capital = 0.0;
  #initial_capital = 0.0;
  #account_value = 0.0;
  #indicators = [];
  #start_date = "2019-01-01";
  #end_date = "2020-01-01";
  #holdings = [];
  #closed_positions = [];
  #realized_pl = 0.0;
  #unrealized_pl = 0.0;
  #current_ohlcv = {};
  #num_ohlcv = 0;
  #num_wins = 0;
  #num_losses = 0;
  #num_trades = 0;
  #win_rate = 0;
  #roi = 0;
  #stop_loss_triggers = {};

  constructor(data) {
    this.#name = data.name || this.#name;

    // Symbol to trade on
    if (!data.symbol) {
      throw "Symbol cannot be null";
      return;
    }
    this.#symbol = data.symbol;

    // Initial capital amount
    if (!data.capital) {
      throw Error("Capital cannot be 0");
      return;
    }
    this.#capital = data.capital;
    this.#initial_capital = data.capital;
    this.#account_value = this.#capital;

    this.#indicators = Object.entries(data.indicators || {});

    this.#start_date = data.start_date || this.#start_date;
    this.#end_date = data.end_date || this.#end_date;
  }

  get symbol() {
    return this.#symbol;
  }

  get capital() {
    return this.#capital;
  }

  /**
   * Update this.#account_value on new price data
   */
  update_account_value(price) {
    let upl = 0;
    if (this.#holdings.length) {
      this.#holdings.map(cur => {
        upl = upl + cur.unrealized_profit_loss(this.#current_ohlcv.close);
      });
    }
    this.#account_value = this.#capital + upl;
    this.#unrealized_pl = upl;
  }

  update_indicators(price) {
    let update = {};
    this.#indicators.map(cur_indi => {
      let name = cur_indi[0];
      let fn = cur_indi[1];
      let val = fn.next(this.#current_ohlcv.close);

      update[name] = val;
    });

    return update;
  }

  /**
   * Simulates a BUY order by the user
   * Creates a new Position objects, pushes it to this.#holdings
   *
   * @param {number} limit limit price to buy security at
   * @param {number} quantity amount to buy
   * @param {number} stop_loss stop loss limit
   * @param {string} time_in_force how long to pend order
   */
  buy(limit, quantity, stop_loss, time_in_force) {
    let position = new Position(
      quantity,
      limit,
      stop_loss,
      time_in_force,
      "long",
      this.#current_ohlcv.date
    );

    let amt = position.cost_basis;
    if (amt > this.#capital) {
      throw Error("Order amount greater than session buying power.");
      return;
    }

    // C = C - CB
    this.#capital = this.#capital - amt;

    this.#holdings.push(position);

    // this.#stop_loss_triggers[stop_loss] = 
    
    console.log(`${position.open_time} BUY ${quantity} ${this.#symbol} @ ${limit}`);
  }

  /**
   * Simulates an SELL on the users
   *
   * Closes the position object
   * Removes the position object from this.#holdings -> this.#closed_positions
   *
   * Updates Session Realized P/L
   *
   * Updates cash available
   *
   * @param {number} index index of position to close
   * @param {number} limit limit price to sell
   * @param {number} quantity amount to sell
   * @param {string} time_in_force time in pending
   */
  sell(index, limit, quantity, time_in_force) {
    if (index >= this.#holdings.length) {
      throw Error("Invalid position index");
    }

    if (this.#holdings.length === 0) {
      throw Error("No open positions");
    }

    let position = this.#holdings[index];
    position.close(limit, quantity, time_in_force, this.#current_ohlcv.date);

    // Move from holdings to closed_positions
    this.#holdings.splice(index, 1);
    this.#closed_positions.push(position);

    // Updated realized P/L
    this.#realized_pl = this.#realized_pl + position.realized_pl;

    // Capital = Capital + (price * qty)
    this.#capital = this.#capital + position.quantity * limit;

    console.log(`${position.close_time} SLL ${quantity} ${this.#symbol} @ ${limit}`);
  }

  /**
   * Executes users strategy per tick.
   * Each tick, the users indicators will update, and account value will reflect
   * the securities price.
   *
   * @param {fn} strategy User's strategy function on price tick
   */
  async backtest(strategy) {
    let indicators = {};

    let ohlcv = await historical_data(
      this.#symbol,
      this.#start_date,
      this.#end_date,
      "d"
    );

    this.#num_ohlcv = ohlcv.length;

    ohlcv.map(price => {
      this.#current_ohlcv = price;

      // Update indicators on new price tick
      indicators = this.update_indicators();

      // Trigger stop losses

      // Update unrealized pl's
      this.update_account_value();

      // Execute user's strategy
      strategy(price, indicators, this.#holdings);
    });

    this.feedback();
  }

  feedback() {
    // ROI = ((AV) / IAV) * 100
    this.#roi = ((this.#realized_pl + this.#unrealized_pl) / this.#initial_capital) * 100;

    // Trade as in a complete open and close on a position...
    this.#num_trades = this.#closed_positions.length;

    // Calculate hit rate
    this.#closed_positions.map(cur => {
      let cur_p_pl = cur.realized_pl;
      if (cur_p_pl > 0) {
        this.#num_wins++;
      } else {
        this.#num_losses++;
      }
    });
    // success = (wins / qty of trades) * 100;
    this.#win_rate = (this.#num_wins / this.#num_trades) * 100;

    console.log('\n');
    console.log(this.#name  + '\n');
    console.log('Account Value\t' + this.#account_value);
    console.log('Realized P/L\t' + this.#realized_pl + '(' + this.#roi + '%)');
    console.log('Unealized P/L\t' + this.#unrealized_pl);
    console.log('');
    console.log('Win Rate\t' + this.#win_rate + '%');
    console.log('Num Trades\t' + this.#num_trades);
    console.log('Winning Trades\t' + this.#num_wins);
    console.log('Losing Trades\t' + this.#num_losses);


  }
}

module.exports = Session;
