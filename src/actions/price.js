const tick = payload => {
  return {
    type: "PRICE_TICK",
    payload
  };
};

module.exports = {
  tick
};
