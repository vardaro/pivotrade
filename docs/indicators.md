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
const Session = require("pivotrade").Session;
const Algorithm = require("pivotrade").Algorithm;
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
const Session = require("pivotrade").Session;
const Algorithm = require("pivotrade").Algorithm;
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

### Volume Weighted Average Price

The `VWAP` implementation is the traditionally computed VWAP, which involves dividing the cumulative money flow by the cumulative volume, as follows:

![img](http://latex.codecogs.com/gif.latex?VWAP%20%3D%20%5Cfrac%7B%5Csum%7B%28TP%20*%20V%29%7D%7D%7B%5Csum%7BV%7D%20%7D)

It computes the cumulative money flow, using the candles <b>typical price</b>, and divides the current value by the cumulative volume.

The `VWAP()` constructors accepts no parameters.

#### Example

```javascript
const Session = require("pivotrade").Session;
const Algorithm = require("pivotrade").Algorithm;
const VWAP = Algorithm.VWAP;

const session = new Session({
  name: "VWAP Example",
  symbol: "SPY",
  capital: 100000,
  indicators: {
    VWAP: new VWAP(),
  }
});

session.backtest((price, account, indicators) => {
  let VWAP = indicators.VWAP;
  console.log(VWAP);
});
```

### Stochastic

The `Stochastic` oscillator implementation is the traditionally computed Stochastic:

![img](http://latex.codecogs.com/gif.latex?%5C%25K%20%3D%20%5Cfrac%7BC%20-%20L14%7D%7BH14%20-%20L14%7D%20*%20100)

```
C = Most recent close
L14 = Lowest 14 period low
H14 = Higher 14 period high
%k = Current value of the Stochastic
```

It's generally accepted if K > 80, the security is over overbought, if K < 30, the security is oversold. K will always be between 0 and 100, and fluctuates depending historical momentum. The Stochastic valued is typically compared to D, which is the 3 period EMA of K.

The `Stochastic()` constructors accepts two optional parameters.

The first of which is a `Number` denoting the period of price data to consider for highs and lows. It defaults to 14.

The second of which is a `Number`, denoting the period of the smoothing EMA of the Stochastic, or %D, which defaults to 3. 

The Stochastic returns an object, containing the most recent values of K, D. D will be 0, for the first N K's having a return value. Buying signals are created when K and D cross.

```javascript
stochastic_output = {
    /* Value of %K */
    k: 0.0,

    /* Value of smoothing EMA */
    d: 0.0
}
```


#### Example

```javascript
const Session = require("pivotrade").Session;
const Algorithm = require("pivotrade").Algorithm;
const Stochastic = Algorithm.Stochastic;

const session = new Session({
  name: "Stoch Example",
  symbol: "SPY",
  capital: 100000,
  indicators: {
    stoch: new Stochastic(),
  }
});

session.backtest((price, account, indicators) => {
  let stoch = indicators.stoch;
  console.log(stoch);
});
```

### Moving Average Convergence Divergence

The `MACD` oscillator implementation is the traditionally computed MACD, that being just the difference between the securities 12 and 26 exponential moving averages. The Signal is the 9 period EMA of the MACD. Buy and Sell signal are produced when the MACD and Signal line cross.

![img](http://latex.codecogs.com/gif.latex?MACD%20%3D%20EMA%2812%29%20-%20EMA%2826%29)

![img](http://latex.codecogs.com/gif.latex?Signal%20%3D%20EMA%289%2C%20MACD%29)

The `MACD()` constructors accepts three optional parameters.

The first of which is a `Number` denoting the period of the fast EMA.

The second of which is a `Number`, denoting the period of the slow EMA.

The third of which is a `Number`, denoting the period of the slow Signal line (EMA of the MACD). 


The Stochastic returns an object, containing the most recent values of MACD, Signal, histogram, fast EMA, slow EMA.

```javascript
macd_output = {
    macd: 0.0,

    signal: 0.0,
    
    /* MACD - Signal */
    histogram: 0.0,

    fast_ema: 0.0,

    slow_ema: 0.0
}
```


#### Example

```javascript
const Session = require("pivotrade").Session;
const Algorithm = require("pivotrade").Algorithm;
const MACD = Algorithm.MACD;

const session = new Session({
  name: "MACD Example",
  symbol: "SPY",
  capital: 100000,
  indicators: {
    macd: new MACD(),
  }
});

session.backtest((price, account, indicators) => {
  let macd = indicators.macd;
  console.log(macd);
});
```