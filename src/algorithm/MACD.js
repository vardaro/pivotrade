const round = require("../util/round");
const EMA = require("./EMA");

class MACDOutput {
  constructor(macd, signal, histogram, fast_ema, slow_ema) {
    this.macd = round(macd);
    this.signal = round(signal);
    this.fast_ema = round(fast_ema);
    this.slow_ema = round(slow_ema);
    this.histogram = round(histogram);
  }
}

/**
 *
 */
class MACD {
  constructor(fast_period = 12, slow_period = 26, signal_period = 9) {
    this.fast_period = fast_period;
    this.slow_period = slow_period;
    this.macd_period = signal_period;

    this.gen = this.calculate();
    this.gen.next();
  }

  *calculate() {
    let fast_ema = new EMA(this.fast_period);
    let slow_ema = new EMA(this.slow_period);
    let signal = new EMA(this.macd_period);
    let macd = 0.0;
    let histogram = 0.0;
    let price = yield;

    while (true) {
      fast_ema = fast_ema.next(price);
      slow_ema = slow_ema.next(price);
      // If the two EMA's don't have values yet, return 0
      // If the fast and slow EMA's have values,
      // Find the MACD, which is the difference in EMA's
      // and find the signal, which is the EMA of the MACD;
      if (fast_ema === 0 || slow_ema === 0) {
        price = yield 0;
      } else {
        signal = fast_ema - slow_ema;
        macd = macd.next(signal);
        histogram = macd - signal;
        // If the MACD finally has data, return it to user
        // Else, return 0
        if (macd > 0) {
          price = yield new MACDOutput(
            macd,
            signal,
            histogram,
            fast_ema,
            slow_ema
          );
        } else {
          price = yield 0;
        }
      }
    }
  }

  next(price, precision = 2) {
    let result = this.gen.next(price).value;

    return result;
  }
}

module.exports = MACD;
