const Position = require("../position");

const initial_state = {
  open: {},
  closed: {},
  stop_losses: [],
  recent: -1
};

const open = (state, payload) => {
  let position = new Position(
    payload.quantity,
    payload.limit,
    payload.stop_loss,
    "GTC",
    "LONG",
    payload.date
  );

  let id = position.id;

  let entry = {
    open: {
      ...state.open,
      [id]: position
    },
    recent: id
  };

  return Object.assign({}, state, entry);
};

const close = (state, payload) => {
  let id = payload.id;

  let position = state.open[id];

  position.close(payload.limit, payload.quantity, payload.time_in_force || "GTC", payload.date);
  delete state.open[id];
  let result = {
    open: {
      ...state.open
    },
    closed: {
      ...state.closed,
      [id]: position
    },
    recent: -1
  }  

  return Object.assign({}, state, result);
};

const positions = (state = initial_state, action) => {
  switch (action.type) {
    case "OPEN":
      return open(state, action.payload);
    case "CLOSE":
      return close(state, action.payload);
    default:
      return state;
  }
};

module.exports = positions;
