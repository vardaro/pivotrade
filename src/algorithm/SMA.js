const round = require("../util/round");

/**
 * SMA(n) = sum(P1 + P2 + ... Pn) / n
 */
class SMA {
  constructor(period) {
    this.period = period;
    this.counter = 0;
    this.history = [];

    this.gen = this.calculate();
    this.gen.next();
  }

  *calculate() {
    let sum = 0;
    let result;
    let close = yield;
    while (true) {
      if (this.counter < this.period) {
        this.history.push(close);
        sum += close;
        result = 0;
      } else {
        let front = this.history.shift();
        sum = sum - front + close;

        result = sum / this.period;
        this.history.push(close);
      }
      this.counter++;
      close = yield result;
    }
  }

  next(price, precision = 2) {
    let result = this.gen.next(price.close).value;

    result = round(result, precision);
    return result;
  }
}

module.exports = SMA;
