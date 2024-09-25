export const SET_CURR_ARTISTS = 'SET_CURR_ARTISTS'
export const SET_CURR_ARTIST = 'SET_CURR_ARTIST'

const initialState = {
  currArtists: [],
  currArtist: {},
}

export function artistReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_CURR_ARTISTS:
      return { ...state, currArtists: action.currArtists }
    case SET_CURR_ARTIST:
      return { ...state, currArtist: action.currArtist }

    default:
      return state
  }
}
