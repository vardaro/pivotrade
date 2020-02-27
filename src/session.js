const yahoo = require("yahoo-finance");
const SMA = require("./algorithm/SMA");
class Session {
  constructor(data) {
    if (!data.symbol) {
      throw "Symbol cannot be null";
      return;
    }
    this.symbol = data.symbol;

    if (!data.capital) {
      throw Error("Capital cannot be 0");
      return;
    }
    this.capital = data.capital;

    this.buying_power = data.buying_power || 1;
    this.account_value;
    this.indicators = Object.entries(data.indicators);


  }

  set_capital(amt) {
    if (!amt) {
      throw Error("Capital cannot be null");
      return;
    }

    this.capital = amt;
  }

  set_buying_power(bp) {
    if (bp < 0) {
      throw Error("BP must be greater than 1");
      return;
    }
    this.buying_power = bp;
  }

  async backtest(cb) {
    let payload = {};

    let data = await yahoo.historical({
      symbol: "AAPL",
      from: "2019-01-01",
      to: "2020-01-31",
      period: "d"
    });

    console.log(this.indicators)
    for (let i = 0; i < data.length; i++ ) {
        let cur = data[i];

        this.indicators.map(cur_inde => {
          let fn = cur_inde[1];
          let val = fn.next(cur);
          let name = cur_inde[0];

          payload[name] = val;
        });

        payload = {...payload, ...cur}

        cb(payload);
      }
  }
}

module.exports = Session;
