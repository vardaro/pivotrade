# Session

The `Session` object represents the current backtesting session and provides an interface for the user to configure different variables to introduce or exclude from the trading session.

The `Session` executes the user backtesting strategy callback on each candlestick, and injects useful metadata about the current trading session into the context of the strategy callback.

It will also attempt to capture the state of the trading session on each candlestick to analyze the strategies performance.

## Reference

### Session(Object)

You can pass an object to the constructor of the Session object to configure metadata about your strategy.

```javascript
const session = new Session({

  /* Name of your strategy. */
  name: "VWAP",

  /* Symbol to trade on. */
  symbol: "MSFT",

  /* Setting initial buying power. */
  capital: 100000,

  /* Define the date range of price data to trade on. 
   *
   * Must be in YYYY-MM-DD format. 
   */ 
  start_date: "2010-01-01",
  end_date: "2020-01-01",

  /*
   * Set candlestick period.
   *
   * In this example, the strategy will trade on the daily
   * candlestick.
   * 
   * This property accepts ['d', 'w', 'm']
   * Adding intraday candlestick will be implemented eventually.
  */
   period: "d",

  /* An object defining which indicators to inject into the context
   *
   * For example, this trading strategy requires the Volume Weight Moving Average (VWAP), 
   * therefore the current VWAP on each candlestick will be injected into the trading session. 
   * 
   * This can be accessed from the trading strategy from indicators["VWAP"]. 
  */
  indicators: {
    VWAP: new VWAP()
  }
});
```

### Session.backtest(Function(price, account, indicators))

### Session.buy()


### Session.sell()