const Position = require("../position");

const initial_state = {
  open: {},
  closed: {},
  stop_losses: 0.0, // Only supports 1 stop loss at a time...
  recent: -1 // Most recently added position
};

/**
 * Opens a position
 * @param {obj} state state
 * @param {obj} payload new data
 */
const open = (state, payload) => {
  let position = new Position(
    payload.quantity,
    payload.limit,
    payload.stop_loss,
    "GTC",
    "LONG",
    payload.date
  );

  // Add the position to state.open
  let id = position.id;

  let entry = {
    open: {
      ...state.open,
      [id]: position
    },
    recent: id,
    stop_losses: position.stop_loss
  };

  return Object.assign({}, state, entry);
};

/**
 * Closes an open position
 *
 * @param {obj} state state
 * @param {obj} payload new data
 */
const close = (state, payload) => {
  let id = payload.id;

  let position = state.open[id];

  // Close position
  position.close(
    payload.limit,
    payload.quantity,
    payload.time_in_force || "GTC",
    payload.date
  );

  //Remove from state.open, add to state.closed
  delete state.open[id];
  let result = {
    open: {
      ...state.open
    },
    closed: {
      ...state.closed,
      [id]: position
    },
    recent: -1,
    stop_losses: 0.0
  };

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
