# Indicators

## About

Pivotrade only supports a handful of classic Technical Analysis indicators, however these are the one I personally find most useful when creating trading algorithms, `VWAP` in particular.

When including an indicator in your strategy, a property in the `indicators` object parameter will be created, and contain the latest value of that indicator for that candlestick.

It's important to note, if the indicator has not seen enough price data to compute its first value, it will return `0.0`. For example, the `Stochastic` oscilator requires 14 periods of price data before computing its initial value, therefore the first 13 periods `Stochastic` will be `0.0`.

## Reference

### Simple Moving Average

The `Simple Moving Average` implementation is the traditionally computed moving average indicator using this formula:

![img](http://latex.codecogs.com/gif.latex?SMA%28n%29%20%3D%20%5Cfrac%7B1%7D%7Bn%7D%7B%5Csum_%7Bi%3D0%7D%5E%7Bn-1%7D%7BP_%7Bc-i%7D%7D%7D)

It takes the average of the last N <b>close</b> prices. SMA's are useful for identifying support and resistance levels of a security.

The `SMA()` constructors accepts one parameter, a`Number`, indicating how many periods to factor into the MA. For example, `SMA(20)` will present the 20 candle MA.

#### Example

```javascript
const Session = require("../index").Session;
const Algorithm = require("../index").Algorithm;
const SMA = Algorithm.SMA;

const session = new Session({
  name: "SMA Crossover",
  symbol: "SPY",
  capital: 100000,
  indicators: {
    SMA20: new SMA(20),
  }
});

session.backtest((price, account, indicators) => {
  let SMA20 = indicators.SMA20;
  console.log(SMA20);
});
```

### Exponential Moving Average

The `Exponential Moving Average` implementation is the traditionally computed EMA indicator using this formula:

![img](http://latex.codecogs.com/gif.latex?EMA%20%3D%20%28Price%28t%29%20*%20k%29%20&plus;%20%28EMA%28y%29%20*%20%281%20-%20k%29%29)

Where:
```
t = today
y = yesterday
n = number of days in EMA
k = 2 / (n + 1)
```

It takes the average of the last N <b>close</b> prices. EMA's are useful for identifying intraday support and resistance levels of a security as it applies extra weight to more recent data.

The `EMA()` constructors accepts one parameter, a`Number`, indicating how many periods to factor into the initial MA. For example, `EMA(20)` will use the 20 candle SMA to compute the first EMA.

#### Example

```javascript
const Session = require("../index").Session;
const Algorithm = require("../index").Algorithm;
const EMA = Algorithm.EMA;

const session = new Session({
  name: "EMA Example",
  symbol: "SPY",
  capital: 100000,
  indicators: {
    EMA: new EMA(5),
  }
});

session.backtest((price, account, indicators) => {
  let EMA = indicators.EMA;
  console.log(EMA);
});
```