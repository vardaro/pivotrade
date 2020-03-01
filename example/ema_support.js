const Session = require("../index").Session;
const Algorithm = require("../index").Algorithm;
const EMA = Algorithm.EMA;

/**
 * Strategy:
 *
 * If a security is trading above is 12 period exponential moving average,
 * enter a long position, setting a stop loss at the EMA support.
 * 
 * Take profit at 10%
 */
const session = new Session({
  name: "EMA Support",
  symbol: "SPY",
  capital: 100000,
  start_date: "2010-01-01",
  end_date: "2020-01-01",
  indicators: {
    EMA: new EMA(12)
  }
});

session.backtest((price, account, indicators) => {
  let EMA = indicators.EMA;

  let cur_price = price.close;
  if (account.positions.length === 0) {
    // Enter long position
    if (EMA < cur_price) {
      let num_shares = Math.floor(account.capital / cur_price);
      session.buy({ limit: cur_price, quantity: num_shares, stop_loss: EMA});
    }
    return;
  }

  if (account.positions.length === 1) {
    let position = account.positions[0];
    let target = position.cost_basis * 1.10;

    // Sell at 5% profit
    if (position.unrealized_pl > target) {
      session.sell({ id: position.id, limit: cur_price, quantity: position.quantity });
    }

  }
});
