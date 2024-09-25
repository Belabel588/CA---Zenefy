import { userService } from '../../services/user.service.js'

export const SET_LOGGED_USER = 'SET_LOGGED_USER'
export const SET_IS_LOADING = 'SET_IS_LOADING'
export const UPDATE_USER = 'UPDATE_USER'

const initialState = {
  loggedinUser: userService.getLoggedinUser(),
  isLoading: false,
}

export function userReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_LOGGED_USER:
      return { ...state, loggedinUser: action.loggedinUser }
    case SET_IS_LOADING:
      return { ...state, isLoading: action.isLoading }
    case UPDATE_USER:
      return { ...state, loggedinUser: action.updatedUser }
    default:
      return state
  }
}
