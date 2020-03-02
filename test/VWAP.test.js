const VWAP = require("../src/algorithm/VWAP");

/**
 * EMA=(P(t) - EMA(y)) * weight + EMA(y)
 */
test("computes VWAP for price set", () => {
  let data = [
    {
      close: 14,
      high: 17,
      low: 10,
      volume: 100
    },
    {
      close: 70,
      high: 71,
      low: 60,
      volume: 200
    },
    {
      close: 71,
      high: 73,
      low: 70,
      volume: 340
    },
    {
      close: 78,
      high: 81,
      low: 77,
      volume: 121
    },
    {
      close: 69,
      high: 70,
      low: 63,
      volume: 80
    },
    {
      close: 81,
      high: 83,
      low: 79,
      volume: 101
    }
  ];

  let ans = [0, 0, 0, 0, 3.42, 6.75, 15.9, 14.63];

  let gen = new VWAP();
  let result = [];
  data.map(cur => {
    let price = {
      close: cur
    };
    let val = gen.next(price);
    result.push(val);
  });
  expect(result).toStrictEqual(ans);
});
