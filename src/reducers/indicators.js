const initial_state = {
  list: [],
  values: {}
};

/**
 * Fills  out the state.values property, which contains the values of each corresponding indicator.
 * @param {state} state
 * @param {array} payload Array of indicators established by the user
 */
const set_indicators = (state, payload) => {
  let ans = {
    list: payload.list,
    values: {}
  };

  ans.list.map(cur => {
    let name = cur[0];
    ans.values[name] = -1;
  });

  return Object.assign({}, state, ans);
};

/**
 * Progresses the generator for each indicator, storing the value in state.values.
 * @param {state} state
 * @param {object} payload Price object
 */
const update_indicators = (state, payload) => {
  let price = payload;
  if (!price) throw Error("Error communicating price tick to indicators");
  
  let ans = {
    values: {}
  };

  state.list.map(cur => {
    let name = cur[0];
    let fn = cur[1];

    let val = fn.next(price);
    ans.values[name] = val;
  });
  return Object.assign({}, state, ans);
};

const indicators = (state = initial_state, action) => {
  switch (action.type) {
    case "SET_INDICATORS":
      return set_indicators(state, action.payload);
    case "UPDATE_INDICATORS":
      return update_indicators(state, action.payload);
    default:
      return state;
  }
};

module.exports = indicators;
