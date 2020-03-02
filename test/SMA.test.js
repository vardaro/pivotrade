const SMA = require("../src/algorithm/SMA");

test("computes SMA(5) for price set", () => {
  let data = [1, 3.99, 4.6, 3.1, 4.4, 13.4, 34.2, 12.1];

  let ans = [0, 0, 0, 0, 3.42, 5.9, 11.94, 13.44];

  let gen = new SMA(5);
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

test("computes SMA(20) for price set", () => {
  let data = [
    3.418,
    5.898,
    11.94,
    13.44,
    1,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1,
    3.418,
    5.898,
    11.94,
    13.44,
    1,
    3.99,
    4.6,
    3.1,
    4.4,
    13.4,
    34.2,
    12.1,
    2.495,
    4.295,
    3.85,
    3.75,
    8.9,
    23.8,
    23.165
  ];

  let ans = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    7.94,
    7.99,
    8.37,
    9.48,
    9.41,
    9.49,
    9.50,
    9.47,
    9.50,
    9.72,
    10.24,
    9.69
  ];

  let gen = new SMA(20);
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

test("computes SMA(50) for price set", () => {
    let data = [1,3,5,6];
  
    let ans = [0,0,0,0];
  
    let gen = new SMA(50);
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