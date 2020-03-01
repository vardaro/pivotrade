const round = require("../util/round");

/**
 * Compute VWAP,
 *
 * VWAP = Cumulative Money Flow / Cumulative Volume
 */
class VWAP {
  constructor() {

    this.gen = this.calculate();
    this.gen.next();
  }

  *calculate() {
    let total_volume = 0;
    let total_money_flow = 0;
    let price = yield;
    while (true) {
      let nicki_minaj = (price.high + price.low + price.close) / 3;
      let money_flow = price.volume * nicki_minaj;

      total_money_flow = total_money_flow + money_flow;
      total_volume = total_volume + price.volume;

      price = yield total_money_flow / total_volume;
    }
  }

  next(price, precision = 2) {
    let result = this.gen.next(price).value;

    result = round(result, precision);
    return result;
  }
}

module.exports = VWAP;
