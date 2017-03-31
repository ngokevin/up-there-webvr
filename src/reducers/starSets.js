
const actions = {
        CREATE_STAR_SET: 'CREATE_STAR_SET'
      , DELETE_STAR_SET: 'DELETE_STAR_SET'
};

module.exports = function(state = {}, action) {
  switch(action.type) {

    case actions.CREATE_STAR_SET:
      let newState = Object.assign({}, state);
      newState[action.key] = action.starset;
      return newState

    case actions.DELETE_STAR_SET:
      return state.filter( (v, k) => k !== action.key )

    default:
      return state
  }
}
