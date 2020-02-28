const Session = require('../index').Session;
const Algorithm = require('../index').Algorithm;
const SMA = Algorithm.SMA;

const session = new Session({
    name: "SMA Crossover",
    symbol: "SPY",
    capital: 100000,
    start_date: "2010-01-01",
    end_date: "2020-01-01",
    indicators: {
        SMA50: new SMA(50),
        SMA20: new SMA(20)
    }
});

session.backtest((price, indicators, positions) => {
    let SMA20 = indicators.SMA20;
    let SMA50 = indicators.SMA50;
    
    // Price is provided in OHLCV format
    let cur_price = price.close;

    if (positions.length === 0) {
        if (SMA20 < SMA50) {
            let num_shares = Math.floor(session.capital / cur_price);
            let stop_loss = 0.90 * cur_price;
            session.buy(cur_price, num_shares, stop_loss, "gtc");     
        }
        return;
    }

    if (positions.length === 1) {
        let position = positions[0];
        if (SMA20 > SMA50 && position.limit < cur_price) {
            session.sell(0, cur_price, position.quantity, "gtc");
        }
    }

});

