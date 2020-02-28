const moment = require('moment');
const uniqid = require('uniqid');

class Position {
  
  constructor(quantity, limit, stop_loss, time_in_force, type, date) {
    this.id = uniqid();

    this.quantity = quantity;
    this.limit = limit;
    this.stop_loss = stop_loss;
    this.time_in_force = time_in_force;
    this.type = type;

    this.cost_basis = this.quantity * this.limit;

    this.open_time = moment(date).format('YYYY-MM-DD');
    this.close_time = null;

    this.risk = (this.stop_loss - this.limit) * quantity;
    this.realized_pl = 0;
    this.unrealized_pl = 0;
    this.open = true;
  }

  close(close_price, qty, time_in_force, date) {
    this.realized_pl += close_price * qty - this.limit * qty;

    this.open = false;
    this.close_time = moment(date).format('YYYY-MM-DD');
    this.unrealized_pl = 0;
  }

  unrealized_profit_loss(price) {
    this.unrealized_pl = this.quantity * price;
    return this.unrealized_pl;
  }
}

module.exports = Position;
