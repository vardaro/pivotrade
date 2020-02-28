class SMA {
    constructor(period) {
        this.period = period;
        this.counter = 0;
        this.history = [];

        this.gen = this.calculate();
        this.gen.next();
    }

    * calculate() {
        let sum = 0;
        let result;
        let close = yield;
        while (true) {

            if (this.counter < this.period) {
                this.history.push(close);
                sum += close;
                result = 0;
            } else {
                let front = this.history.shift();
                sum = sum - front + close;

                result = sum / this.period;
                this.history.push(close);

            }
            this.counter++;
            close = yield result;
        }

    }

    next(price, precision=2) {
        let result = this.gen.next(price).value;

        result = result.toFixed(precision);
        return result;
    }
}



module.exports = SMA;