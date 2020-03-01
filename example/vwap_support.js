const Session = require("../index").Session;
const Algorithm = require("../index").Algorithm;
const VWAP = Algorithm.VWAP;

/**
 * Strategy:
 *
 * If the securities price moves above the historical VWAP, a shift in
 * market sentiment has occured, meaning buyers are entering the market and momentum will begin to accelerate.
 *
 * Enter a long positon, close position at 5% profitability.
 */
const session = new Session({
  name: "VWAP Support",
  symbol: "SPY",
  capital: 100000,
  start_date: "2010-01-01",
  end_date: "2020-01-01",
  indicators: {
    VWAP: new VWAP()
  }
});

session.backtest((price, account, indicators) => {
  let VWAP = indicators.VWAP;
  let cur_price = price.close;
  if (account.positions.length === 0) {
    // Enter long position
    if (VWAP > cur_price) {
      let num_shares = Math.floor(account.capital / cur_price);
      session.buy({ limit: cur_price, quantity: num_shares});
      console.log(VWAP)
    }
    return;
  }

  if (account.positions.length === 1) {
    let position = account.positions[0];
    let target = position.cost_basis * 1.05;

    // Sell at 5% profit
    if (position.unrealized_pl > target) {
      session.sell({ id: position.id, limit: cur_price, quantity: position.quantity });
    }

  }
});
