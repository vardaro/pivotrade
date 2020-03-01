const set_indicators = payload => {
  return {
    type: "SET_INDICATORS",
    payload
  };
};

const update_indicators = payload => {
  return {
    type: "UPDATE_INDICATORS",
    payload
  };
};

module.exports = {
  set_indicators,
  update_indicators
};
