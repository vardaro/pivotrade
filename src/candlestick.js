const uniqid = require("uniqid");

class Candlestick {
  constructor(open, high, low, close, volume, date) {
    this.id = uniqid();
    this.open = open;
    this.high = high;
    this.low = low;
    this.close = close;
    this.volume = volume;
    this.date = date;
  }

  /**
   * Returns the typical price
   * which is the average of the high, low, and close.
   */
  typical_price() {
    let sum = this.high + this.low + this.close;
    return sum / 3;
  }

  /**
   * Returns whether the candle is bullish or bearish
   */
  sentiment() {
    if (this.close > this.open) {
      return "BULLISH";
    } else if (this.close < this.open) {
      return "BEARISH";
    } else {
      return "NEUTRAL";
    }
  }

  /**
   * Return's whether candle is a doji
   * 
   * by checking if the open and close are kind of near each other..
   */
  is_doji() {
      let diff = Math.abs(this.open - this.close);
      return diff < .01;
  }

  /**
   * Returns the upper shadow length
   */
  upper_shadow_length() {
    let shadow = 0;
    if (this.sentiment() === "BULLISH") {
      shadow = this.high - this.close;
    } else {
      shadow = this.high - this.open;
    }

    return shadow;
  }

  /**
   * Returns the lower shadow length
   */
  lower_shadow_length() {
    let shadow = 0;
    if (this.sentiment() === "BULLISH") {
      shadow = this.low - this.open;
    } else {
      shadow = this.low - this.close;
    }

    return shadow;
  }
}

module.exports = Candlestick;
