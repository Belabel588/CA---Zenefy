import { legacy_createStore as createStore, combineReducers } from 'redux'

import { songReducer } from './reducers/song.reducer.js'
import { userReducer } from './reducers/user.reducer.js'
import { reviewReducer } from './reducers/review.reducer.js'
import { systemReducer } from './reducers/system.reducer.js'

const rootReducer = combineReducers({
  songModule: songReducer,
  userModule: userReducer,
  systemModule: systemReducer,
  reviewModule: reviewReducer,
})

const middleware = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()
  : undefined
export const store = createStore(rootReducer, middleware)

// For debug:
// store.subscribe(() => {
//     console.log('**** Store state changed: ****')
//     console.log('storeState:\n', store.getState())
//     console.log('*******************************')
// })
