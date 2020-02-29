/**
 * Rounds a decimal number
 * @param {Number} num number to round
 * @param {Number} decimal places to round to
 */
const round = (num, decimal=2) => {

    // Shift n number of digits left of the decimal, parse the float
    let left = num + 'e' + decimal;
    let float = Math.round(parseFloat(left));

    // Shift n number of digits from left of decimal back to the right
    let right = float + 'e-' + decimal;

    // Cast 
    return Number(right);

};

module.exports = round;