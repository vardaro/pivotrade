const Session = require("../index").Session;
const Algorithm = require("../index").Algorithm;
const SMA = Algorithm.SMA;

const session = new Session({
  name: "SMA Crossover",
  symbol: "SPY",
  capital: 100000,
  start_date: "2010-01-01",
  end_date: "2020-01-01",
  indicators: {
    SMA50: new SMA(50),
    SMA20: new SMA(20)
  }
});

session.backtest((price, account, indicators) => {
  let SMA20 = indicators.SMA20;
  let SMA50 = indicators.SMA50;

  console.log(price);
  // Price is provided as a Candlestick object
  let cur_price = price.close;
  if (account.positions.length === 0) {
    if (SMA20 > SMA50) {
      let num_shares = Math.floor(account.capital / cur_price);
      let stop_loss = 0.90 * cur_price;
      session.buy({ limit: cur_price, quantity: num_shares, stop_loss: stop_loss});
    }
    return;
  }

  if (account.positions.length === 1) {
    let position = account.positions[0];
    if (SMA20 < SMA50) {
      session.sell({ id: position.id, limit: cur_price, quantity: position.quantity });
    }
  }
});
