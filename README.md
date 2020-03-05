## Pivotrade

Pivotrade is a Node.js backtesting framework for testing trading strategies on historical price data. 

Pivotrades requires only a callback function and will handle historical price data, performance monitoring, and state management, giving you the freedom to focus more on strategy and less on infrastructure.

## Getting Started

Here is an example implementation of a classic Simple Moving Average (SMA) crossover strategy trading on the S&P ETF. A strategy that involves:
- Buying <strong>N</strong> shares of a security when it's 20 day moving average crosses above its 50 day moving average. Set a stop loss at 10% below it's long entry price.

- Selling <strong>N</strong> shares of a security when its 20 day average falls below the 50 day average.

Also known as the "Hello World" of algotrading!

```javascript
// node example/sma_cross.js

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

  let cur_price = price.close;
  if (account.positions.length === 0) {
    if (SMA20 > SMA50) {
      let num_shares = Math.floor(account.capital / cur_price);
      let stop_loss = 0.90 * cur_price;
      session.buy({ limit: cur_price, quantity: num_shares, stop_loss: stop_loss});
    }
  }

  if (account.positions.length === 1) {
    let position = account.positions[0];
    if (SMA20 < SMA50) {
      session.sell({ id: position.id, limit: cur_price, quantity: position.quantity });
    }
  }
});
```
The user has the power to configure the technical indicators provided by the framework. These indicators are dynamically injected into the context of the backtesting function, alongside other metadata about the trading session, to assist the user in generating <strong>buy</strong> and <strong>sell</strong> signals to the framework.

## Documentation

Feel free to visit the [documentation](https://vardaro.me/pivotrade)
