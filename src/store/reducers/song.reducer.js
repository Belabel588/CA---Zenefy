export const SET_SONGS = 'SET_SONGS'
export const SET_SONG = 'SET_SONG'
export const REMOVE_SONG = 'REMOVE_SONG'
export const ADD_SONG = 'ADD_SONG'
export const UPDATE_SONG = 'UPDATE_SONG'
export const ADD_SONG_MSG = 'ADD_SONG_MSG'

const initialState = {
  songs: [],
  song: null,
}

export function songReducer(state = initialState, action) {
  var newState = state
  var songs
  switch (action.type) {
    case SET_SONGS:
      newState = { ...state, songs: action.songs }
      break
    case SET_SONG:
      newState = { ...state, song: action.song }
      break
    case REMOVE_SONG:
      const lastRemovedSong = state.songs.find(
        (song) => song._id === action.songId
      )
      songs = state.songs.filter((song) => song._id !== action.songId)
      newState = { ...state, songs, lastRemovedSong }
      break
    case ADD_SONG:
      newState = { ...state, songs: [...state.songs, action.song] }
      break
    case UPDATE_SONG:
      songs = state.songs.map((song) =>
        song._id === action.song._id ? action.song : song
      )
      newState = { ...state, songs }
      break
    case ADD_SONG_MSG:
      newState = {
        ...state,
        song: { ...state.song, msgs: [...(state.song.msgs || []), action.msg] },
      }
      break
    default:
  }
  return newState
}

// unitTestReducer()

function unitTestReducer() {
  var state = initialState
  const song1 = {
    _id: 'b101',
    vendor: 'Song ' + parseInt(Math.random() * 10),
    msgs: [],
  }
  const song2 = {
    _id: 'b102',
    vendor: 'Song ' + parseInt(Math.random() * 10),
    msgs: [],
  }

  state = songReducer(state, { type: SET_SONGS, songs: [song1] })
  console.log('After SET_CARS:', state)

  state = songReducer(state, { type: ADD_SONG, song: song2 })
  console.log('After ADD_SONG:', state)

  state = songReducer(state, {
    type: UPDATE_SONG,
    song: { ...song2, vendor: 'Good' },
  })
  console.log('After UPDATE_SONG:', state)

  state = songReducer(state, { type: REMOVE_SONG, songId: song2._id })
  console.log('After REMOVE_SONG:', state)

  const msg = { id: 'm' + parseInt(Math.random() * 100), txt: 'Some msg' }
  state = songReducer(state, { type: ADD_SONG_MSG, songId: song1._id, msg })
  console.log('After ADD_SONG_MSG:', state)

  state = songReducer(state, { type: REMOVE_SONG, songId: song1._id })
  console.log('After REMOVE_SONG:', state)
}
