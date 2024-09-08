import { stationReducer } from './reducers/station.reducer.js'
import { userReducer } from './reducers/user.reducer.js'
import { artistReducer } from './reducers/artist.reducer.js'

import {
  legacy_createStore as createStore,
  combineReducers,
  compose,
} from 'redux'

const rootReducer = combineReducers({
  stationModule: stationReducer,
  userModule: userReducer,
  artistModule: artistReducer,
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(rootReducer, composeEnhancers())

// for DEBUGGING
window.gStore = store
