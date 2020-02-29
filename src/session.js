const Position = require("./position");
const historical_data = require("./util/historical_data");
const round = require("./util/round");

class Session {
  #name = "";
  #symbol = "";
  #capital = 0.0;
  #initial_capital = 0.0;
  #account_value = 0.0;
  #indicators = [];
  #start_date = "2019-01-01";
  #end_date = "2020-01-01";
  #holdings = {};
  #closed_positions = {};
  #realized_pl = 0.0;
  #unrealized_pl = 0.0;
  #current_ohlcv = {};
  #num_ohlcv = 0;
  #num_wins = 0;
  #num_losses = 0;
  #num_trades = 0;
  #win_rate = 0;
  #roi = 0;
  #lower_stop_loss = {
    price: -1,
    position_id: -1
  };
  #upper_stop_loss = {
    price: -1,
    position_id: -1
  };

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
    this.#capital = round(data.capital);
    this.#initial_capital = this.#capital;
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
  update_account_value() {
    let upl = 0;

    // Sum unrealized p/l for each holding
    upl = Object.values(this.#holdings).reduce(
      (a, b) => a + (b.unrealized_profit_loss(this.#current_ohlcv.close) || 0),
      0
    );

    this.#account_value = round(this.#capital + upl);
    this.#unrealized_pl = round(upl);
  }

  update_indicators() {
    let update = {};
    this.#indicators.map(cur_indi => {
      let name = cur_indi[0];
      let fn = cur_indi[1];
      let val = fn.next(this.#current_ohlcv.close);

      update[name] = val;
    });

    return update;
  }

  check_stop_losses() {
    if (Object.keys(this.#holdings).length === 0) return;

    let cur_price = this.#current_ohlcv.close;

    // Check long position stop loss
    if (cur_price < this.#lower_stop_loss.price) {
      let position_id = this.#lower_stop_loss.position_id;
      this.sell(
        position_id,
        cur_price,
        this.#holdings[position_id].quantity,
        "gtc"
      );
      console.log("stop loss trigger");
    } else if (cur_price > this.#upper_stop_loss.price) {
      let position_id = this.#upper_stop_loss.id;
      // this.buy(
      //   position_id,
      //   cur_price,
      //   this.#holdings[position_id].quantity,
      //   "gtc"
      // );
    }
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
    this.#capital = round(this.#capital - amt);

    // this.#holdings.push(position);
    this.#holdings[position.id] = position;

    if (stop_loss) {
      this.#lower_stop_loss = {
        price: stop_loss,
        position_id: position.id
      };
    }

    console.log(
      `${position.open_time} BUY ${quantity} ${
        this.#symbol
      } @ ${limit}  - STOP ${stop_loss}`
    );
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
  sell(id, limit, quantity, time_in_force) {
    let position = this.#holdings[id];
    position.close(limit, quantity, time_in_force, this.#current_ohlcv.date);

    // Move from holdings to closed_positions
    // this.#holdings.splice(index, 1);
    delete this.#holdings[position.id];
    this.#closed_positions[position.id] = position;
    // this.#closed_positions.push(position);

    // Updated realized P/L
    this.#realized_pl = round(this.#realized_pl + position.realized_pl);

    // Capital = Capital + (price * qty)
    this.#capital = round(this.#capital + position.quantity * limit);

    console.log(
      `${position.close_time} SLL ${quantity} ${this.#symbol} @ ${limit}`
    );
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
      this.check_stop_losses();

      // Update unrealized pl's
      this.update_account_value();

      // Execute user's strategy
      strategy(price, indicators, Object.values(this.#holdings));
    });

    this.feedback();
  }

  feedback() {
    // ROI = ((AV) / IAV) * 100
    this.#roi =
      ((this.#realized_pl + this.#unrealized_pl) / this.#initial_capital) * 100;

    // Trade as in a complete open and close on a position...
    this.#num_trades = 0;

    // Calculate hit rate
    Object.values(this.#closed_positions).map(cur => {
      let cur_p_pl = cur.realized_pl;
      if (cur_p_pl > 0) {
        this.#num_wins++;
      } else {
        this.#num_losses++;
      }
      this.#num_trades++;
    });
    // success = (wins / qty of trades) * 100;
    this.#win_rate = (this.#num_wins / this.#num_trades) * 100;

    console.log("\n");
    console.log(this.#name + "\n");
    console.log("Account Value\t" + this.#account_value);
    console.log("Starting Value\t" + this.#initial_capital);
    console.log("Realized P/L\t" + this.#realized_pl + " (" + this.#roi + "%)");
    console.log("Unealized P/L\t" + this.#unrealized_pl);
    console.log("");
    console.log("Win Rate\t" + this.#win_rate + "%");
    console.log("Num Trades\t" + this.#num_trades);
    console.log("Winning Trades\t" + this.#num_wins);
    console.log("Losing Trades\t" + this.#num_losses);
    console.log("");
  }
}

module.exports = Session;
