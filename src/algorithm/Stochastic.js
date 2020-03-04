const EMA = require("../algorithm/EMA");

class StochasticOutput {
  constructor(k, d) {
    this.k = k;
    this.d = d;
    this.overbought = this.k > 80;
    this.oversold = this.k < 20;
  }
}

/**
 * Compute Stochastic oscillator
 *
 * K = ((C - L14) / (H14 - L14)) * 100
 * D = EMA(3, K);
 */
class Stochastic {
  constructor(period = 14, smooth = 3) {
    this.highs = [];
    this.lows = [];

    this.period = period;
    this.smooth = smooth;
    this.counter = 0;

    this.gen = this.calculate();
    this.gen.next();
  }

  *calculate() {
    let k = 0.0;
    let d = 0.0;
    let d_fn = new EMA(this.smooth);

    let price = yield;
    while (true) {
      // Push the High and Low to the array if we haven't seen 14 candles
      // Else, compute normal stochastic
      if (this.counter < this.period) {
        this.highs.push(price.high);
        this.lows.push(price.low);
        this.counter++;
        price = yield 0;
      } else {
        // Pop the front...
        this.highs.shift();
        this.lows.shift();

        // Push the new numbers to the back
        this.highs.push(price.high);
        this.lows.push(price.low);

        // Compute K, and tick D
        let low = Math.min(...this.lows);
        let high = Math.max(...this.highs);
        let c = price.close;

        k = ((c - low) / (high - low)) * 100;
        d = d_fn.next({close: k});

        price = yield new StochasticOutput(k, d);
      }
    }
  }

  next(price, precision = 2) {
    let result = this.gen.next(price).value;

    return result;
  }
}

module.exports = Stochastic;
