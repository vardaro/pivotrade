const SMA = require('../src/algorithm/SMA');

let data = [
  { close: 1 },
  { close: 3.99 },
  { close: 4.6 },
  { close: 3.1 },
  { close: 4.4 },
  { close: 13.4 },
  { close: 34.2 },
  { close: 12.1 }
];

let ans = [0, 0, 0, 0, 3.42, 5.9, 11.94, 13.44];

test("computes SMA(5) for price set", () => {
    let gen = new SMA(5);
    let result= [];
    data.map(cur => {
        let val = gen.next(cur);
        result.push(val);
    });
    console.log(result);
    expect(result).toStrictEqual(ans);
});
