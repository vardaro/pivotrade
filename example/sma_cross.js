const Session = require('../index').Session;
const Algorithm = require('../index').Algorithm;
const SMA = Algorithm.SMA;

let session = new Session({
    symbol: "SPY",
    capital: 100000,
    indicators: {
        SMA50: new SMA(50),
        SMA20: new SMA(20)
    }
});

session.backtest((payload) => {
    console.log(payload);
});

