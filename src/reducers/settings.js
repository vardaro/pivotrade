const initial_state = {
    name: "",
    symbol: "",
    start_date: "2019-01-01",
    end_date: "2020-01-01",
    period: "d"
  }
  

const update_settings = (state = initial_state, action) => {
  switch (action.type) {
    case "UPDATE_SETTINGS":
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};

module.exports = update_settings;