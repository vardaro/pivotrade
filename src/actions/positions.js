const open = payload => {
  return {
    type: "OPEN",
    payload
  };
};

const close = payload => {
  return {
    type: "CLOSE",
    payload
  };
};

module.exports = {
  open,
  close
};
