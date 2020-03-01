const round = require("../util/round");
const SMA = require("./SMA");
/**
 * EMA=Price(t)×k+EMA(y)×(1−k)
 */
class EMA {
  constructor(period) {
    this.period = period;
    this.counter = 0;
    this.history = [];
    this.weight = 2 / (this.period + 1);

    this.gen = this.calculate();
    this.gen.next();
    this.gen.next();
  }

  *calculate() {
    let sma = new SMA(this.period);
    let prev_ema = 0.0;
    let price = yield;
    while (true) {
      // prev_ema will remain 0 until the SMA finally returns it's first entry
      // we use that first entry to see the EMA
      if (prev_ema !== 0.0 && price !== undefined) {
        prev_ema = (price.close - prev_ema) * this.weight + prev_ema;
        price = yield prev_ema;
      } else {
        // Tick the SMA
        price = yield;
        prev_ema = sma.next(price);

        if (prev_ema !== 0.0) {
          price = yield prev_ema;
        }
      }
    }
  }

  next(price, precision = 2) {
    let result = this.gen.next(price).value;

    result = round(result, precision);
    return result;
  }
}

module.exports = EMA;
