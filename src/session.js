const Position = require("./position");
const historical_data = require('./util/historical_data')

class Session {
  
  constructor(data) {
    // Symbol to trade on
    if (!data.symbol) {
      throw "Symbol cannot be null";
      return;
    }
    this.symbol = data.symbol;

    // Initial capital amount
    if (!data.capital) {
      throw Error("Capital cannot be 0");
      return;
    }
    this.capital = data.capital;

    // Array of indicator objects
    this.indicators = Object.entries(data.indicators || {});

    this.account_value = this.capital;

    this.start_date = data.start_date || "2019-01-01";
    this.end_date = data.end_date || "2020-01-01";

    this.holdings = [];
    this.closed_positions = [];

    this.realized_pl = 0;
    this.unrealized_pl = 0;
  }

  /**
   * Resize capital amount of
   * @param {number} amt
   */
  set_capital(amt) {
    if (!amt) {
      throw Error("Capital cannot be null");
      return;
    }

    this.capital = amt;
  }

  /**
   * Update account leverage
   * @param {number} bp
   */
  set_leverage(bp) {
    if (bp < 0) {
      throw Error("BP must be greater than 1");
      return;
    }
    this.buying_power = bp;
  }

  /**
   * Update this.account_value on new price data
   */
  update_account_value(price) {
    let upl = 0;
    if (this.holdings.length) {
      this.holdings.map(cur => {
        upl = upl + cur.unrealized_profit_loss(price);
      });
    }
    this.account_value = this.capital + upl;
    this.unrealized_pl = upl;
  }

  update_indicators(price) {
    let update = {};
    this.indicators.map(cur_indi => {
      let name = cur_indi[0];
      let fn = cur_indi[1];
      let val = fn.next(price);

      update[name] = val;
    });

    return update;
  }

  buy(limit, quantity, stop_loss, time_in_force) {
    let p = new Position(quantity, limit, stop_loss, time_in_force, "long");

    let amt = p.cost_basis;
    if (amt > this.capital) {
      throw Error("Order amount greater than session buying power");
      return;
    }

    // C = C - CB
    this.capital = this.capital - amt;

    this.holdings.push(p);

    console.log(`BUY ${quantity} ${this.symbol} at ${limit}`);
  }

  sell(index, limit, quantity, time_in_force) {
    if (index >= this.holdings.length) {
      throw Error("Invalid position index");
    }

    if (this.holdings.length === 0) {
      throw Error("No open positions");
    }


    let position = this.holdings[index];
    position.close(limit, quantity, time_in_force);

    // Move from holdings to closed_positions
    this.holdings.splice(index, 1);
    this.closed_positions.push(position);

    // Updated realized P/L
    this.realized_pl = this.realized_pl + position.realized_pl;

    // Capital = Capital + (price * qty)
    this.capital = this.capital + (position.quantity * limit);

    console.log(`SELL ${quantity} ${this.symbol} at ${limit}`);

  }

  async backtest(strategy) {
    let indicators = {};

    let ohlcv = await historical_data(this.symbol, this.start_date, this.end_date, "d");

    ohlcv.map(price => {

      // Update indicators on new price tick
      indicators = this.update_indicators(price);

      // Update unrealized pl's
      this.update_account_value(price.close);

      // Execute user's strategy
      strategy(price, indicators);

    });

    console.log(this);

  }
}

module.exports = Session;
