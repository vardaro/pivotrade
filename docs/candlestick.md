# Candlestick

The `Candlestick` object is the price object that gets passed to your strategy callback function.

## Reference

### Candlestick(open, high, low, close, volume, date)

The `Candlestick` object does have constructor in case you may decide to create your own instances.

```javascript
let price = new Candlestick(
  10,
  20,
  5,
  14,
  100,
  new Date()
);
```

### Candlestick.typical_price()

Returns the [typical price](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/typical-price) of a candlestick.

![img](http://latex.codecogs.com/gif.latex?TP%20%3D%20%5Cfrac%7BH%20&plus;%20L%20&plus;%20C%7D%7B3%7D "Typical Price")
```javascript
price.typical_price(); // 13.00
```

### Candlestick.sentiment()

Detects bullish or bearish sentiment of the candle.

```javascript
price.sentiment() // 'BULLISH'
```

### Candlestick.upper_shadow_length()

Returns the distance between the upper wick and body of the candle.

```javascript
price.upper_shadow_length(); // 10.0
```

### Candlestick.lower_shadow_length()

Returns the distance between the lower wick and body of the candle.

```javascript
price.lower_shadow_length(); // 9.00
```

### Candlestick.is_doji()

Returns a boolean denoting whether the candle is a doji.

```javascript
price.is_doji() // false
```