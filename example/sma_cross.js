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

session.backtest((price, indicators) => {

    let SMA20 = indicators.SMA20;
    let SMA50 = indicators.SMA50;
    
    // If flat, and fast > slow, long 100% into holdings
    if (session.holdings.length == 0) {
        if (SMA20 < SMA50) {
            let num_shares = Math.floor(session.capital / price.close);
            let stop_loss = (.90) * price.close;
            session.buy(price.close, num_shares, stop_loss, "gtc");
        }
    }

    if (session.holdings.length == 1) {
        let position = session.holdings[0];
        if (SMA20 > SMA50 && position.limit < price.close) {
            session.sell(0, price.close, session.holdings[0].quantity, "gtc");
        }
    }

});

