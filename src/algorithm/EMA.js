const round = require("../util/round");
const SMA = require("./SMA");
/**
 * EMA=(P(t) - EMA(y)) * weight + EMA(y)
 * https://www.thebalance.com/simple-exponential-and-weighted-moving-averages-1031196
 * 
 */
class EMA {
  constructor(period) {
    this.period = period;

    this.weight = 2 / (this.period + 1);

    this.gen = this.calculate();
    this.gen.next();
  }

  *calculate() {
    let sma = new SMA(this.period);
    let prev_ema = 0.0;
    let price;
    while (true) {
      // prev_ema will remain 0 until the SMA finally returns it's first entry
      // we use that first entry to seed the EMA, every subsequent call to this generator will execute this block
      if (prev_ema !== 0.0 && price !== undefined && price.close !== undefined) {
        prev_ema = (price.close - prev_ema) * this.weight + prev_ema;
        price = yield prev_ema;
      } else {
        // Tick the SMA
        // generators confuse me
        price = yield prev_ema;
        prev_ema = sma.next(price);

        if (prev_ema) {
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
