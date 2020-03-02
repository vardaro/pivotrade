const MACD = require("../src/algorithm/MACD");

test("computes MACD for price set", () => {
  let data = [
    11,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1,
    1,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1,
    1,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1,
    1,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1,
    13.4,
    34.2,
    12.1,
    1,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1
  ];

  let ans = [0, 0, 0, 0, 3.42, 6.75, 15.9, 14.63];

  let gen = new MACD();
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
