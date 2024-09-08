import {
  SET_CURR_ARTIST,
  SET_CURR_ARTISTS,
} from '../reducers/artist.reducer.js'

import { store } from '../store.js'

export function setCurrArtists(artists) {
  store.dispatch({ type: SET_CURR_ARTISTS, currArtists: artists })

  return artists
}
export function setCurrArtist(artist) {
  store.dispatch({ type: SET_CURR_ARTIST, currArtist: artist })

  return artist
}
