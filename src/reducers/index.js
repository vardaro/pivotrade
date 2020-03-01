const combineReducers = require('redux').combineReducers;

const price = require('./price');
const money = require('./money');
const positions = require('./positions');
const performance = require('./performance');
const indicators = require('./indicators');
const settings = require('./settings');

module.exports = combineReducers({
    price,
    money,
    positions,
    performance,
    indicators,
    settings
})