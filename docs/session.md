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

The `Session.backtext()` accepts a callback function that gets executed on every price tick. The callback function accepts 3 parameters:

- price
- account
- indicators

#### Price

Price is a `Candlestick` object, denoting the current candlestick in the iteration.

#### Account

Account is an object containing metadata about the users account.

```javascript
account {
    /* Array of Position objects */
    positions: []

    /* Dollar amount started with */
    initial_capital: 0.0,

    /* Value of account (cash + equitable assets) */
    account_value: 0.0,

    /* Realized P/L */
    realized_gain: 0.0,

    /* Unrealized P/L (from unclosed positions) */
    unrealized_gain: 0.0,
}
```

#### Indicators

Indicators is an object containing the most recent values of the indicators you selected.

```javascript
/* Print the current SMA(20) for each candlestick */
const session = new Session({
  name: "Print SMA(20)",
  symbol: "SPY",
  indicators: {
    SMA20: new SMA(20)
  }
});

session.backtest((price, account, indicators) => {
  let SMA20 = indicators.SMA20;
  console.log(`The current 20 SMA is ${SMA20}`);
});
```

### Session.buy(Object)

`Session.buy()` executes a buy order on the selected stock and updates the session state accordingly. It takes an Object as a parameter denoting important informatiation about the order. Technically it does a limit order.

This will cause a new `Position` object to get pushed to the `account.positions` array.

This function will throw an error if the cost basis of the order exceeds the cash on hand of the account.

```javascript
buy_object = {
  /* The price at which to execute the limit order */
  limit: 321.21,

  /* Number of shares to purcahse of the security */
  quantiity: 100,

  /* You can optionally set a stop_loss price
   * If the price falls below the stop loss, it will trigger a sell,
   * incurring a loss.
   * 
   * I sure hope you like to set stop losses on your trades :)
   */
  stop_loss: 300.00
};

session.buy(buy_object);
```

### Session.sell()

## Examples
