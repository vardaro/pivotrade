const Stochastic = require("../src/algorithm/Stochastic");

/**
 * EMA=(P(t) - EMA(y)) * weight + EMA(y)
 */
test("computes EMA(5) for price set", () => {
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
    },
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
      },
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


  let gen = new Stochastic();
  let result = [];
  data.map(cur => {
    let val = gen.next(cur);
    result.push(val);
  });
  console.log(result);
//   expect(result).toStrictEqual(ans);
});
