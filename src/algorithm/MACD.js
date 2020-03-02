const round = require("../util/round");
const EMA = require("./EMA");

class MACDOutput {
  constructor(macd, signal, histogram, fast_ema, slow_ema) {
    this.macd = round(macd);
    this.signal = round(signal);
    this.histogram = round(histogram);
    this.fast_ema = round(fast_ema);
    this.slow_ema = round(slow_ema);
  }
}

/**
 * https://www.investopedia.com/ask/answers/122414/what-moving-average-convergence-divergence-macd-formula-and-how-it-calculated.asp
 *
 * The MACD consists of three values:
 * 1. MACD line
 * 2. Signal line
 * 3. Histogram
 *
 * The MACD is calculated:
 *
 * MACD = EMA(12) - EMA(26);
 * Signal = EMA(9, MACD)   (The 9 tick exponetial moving average of the MACD)
 * Histogram = MACD - Signal   (In other words, the difference between the real MACD and it's average)
 *
 */
class MACD {
  constructor(fast_period = 12, slow_period = 26, signal_period = 9) {
    this.fast_period = fast_period;
    this.slow_period = slow_period;
    this.signal_period = signal_period;

    this.gen = this.calculate();
    this.gen.next();
  }

  *calculate() {
    let fast_ema_fn = new EMA(this.fast_period);
    let slow_ema_fn = new EMA(this.slow_period);
    let signal_fn = new EMA(this.signal_period);

    let fast_ema = 0.0;
    let slow_ema = 0.0;
    let signal = 0.0;
    let macd = 0.0;
    let histogram = 0.0;
    let price = yield;

    while (true) {
      fast_ema = fast_ema_fn.next(price);
      slow_ema = slow_ema_fn.next(price);
      // If the two EMA's don't have values yet, return 0
      // If the fast and slow EMA's have values,
      // Find the MACD, which is the difference in EMA's
      // and find the signal, which is the EMA of the MACD;
      if (fast_ema === 0 || slow_ema === 0) {
        price = yield 0;
      } else {
        macd = fast_ema - slow_ema;
        signal = signal_fn.next({ close: macd }); // Gotta send MACD number as a price object.. ema understands
        histogram = macd - signal;

        // If the MACD finally has data, return it to user
        // Else, return 0
        price = yield new MACDOutput(
          macd,
          signal,
          histogram,
          fast_ema,
          slow_ema
        );
      }
    }
  }

  next(price, precision = 2) {
    let result = this.gen.next(price).value;

    return result;
  }
}

module.exports = MACD;
