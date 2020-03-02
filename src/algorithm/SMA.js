const round = require("../util/round");

/**
 * SMA(n) = sum(P1 + P2 + ... Pn) / n
 */
class SMA {
  constructor(period) {
    this.period = period;
    this.counter = 1;
    this.history = [];

    this.gen = this.calculate();
    this.gen.next();
  }

  *calculate() {
    let sum = 0;
    let result;
    let close = yield;
    while (true) {
      // Add the newest entry to the window
      this.history.push(close);

      if (this.counter < this.period) {
        sum += close;
        result = 0;
        this.counter++;

      } else {
        // Get the average
        result = (sum + close) / this.period;

        // Remove the oldest entry. Remove the oldest entry from sum, add the newest entry to sum
        let front = this.history.shift();
        sum = sum - front + close;

      }
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
