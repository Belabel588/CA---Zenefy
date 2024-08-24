import { stationService } from '../../services/stations.service'

// Action Types
export const SET_CURRENTLY_PLAYED_STATION = 'SET_CURRENTLY_PLAYED_STATION'
export const SET_STATIONS = 'SET_STATIONS'
export const REMOVE_STATION = 'REMOVE_STATION'
export const ADD_STATION = 'ADD_STATION'
export const UPDATE_STATION = 'UPDATE_STATION'
export const SET_FILTER_BY = 'SET_FILTER_BY'
export const SET_IS_LOADING = 'SET_IS_LOADING'
export const SET_NEXT_SONG = 'SET_NEXT_SONG'
export const SET_PREV_SONG = 'SET_PREV_SONG'

// Initial state
const initialState = {
  stations: [],  // All stations data
  currentlyPlayedStation: stationService.getEmptyStation(),  // Currently played station
  currentSongIndex: 0,  // Track the index of the currently playing song
  songOrder: {
    currentSongURL: '',  // The currently playing song URL
    nextSongURL: '',  // The next song URL
    prevSongURL: '',  // The previous song URL
  },
  filterBy: stationService.getDefaultFilter(),  // Filter criteria
  isLoading: false,  // Loading state for asynchronous actions
}

// Reducer function
export function stationReducer(state = initialState, action = {}) {
  switch (action.type) {
    
    // When stations are loaded into the state
    case SET_STATIONS:
      return { ...state, stations: action.stations }

    // When a station is removed from the state
    case REMOVE_STATION:
      const stations = state.stations.filter(
        (station) => station._id !== action.stationId
      )
      return { ...state, stations }

    // When a new station is added to the state
    case ADD_STATION:
      return { ...state, stations: [...state.stations, action.station] }

    // When a station is updated in the state
    case UPDATE_STATION:
      const updatedStations = state.stations.map((station) =>
        station._id === action.station._id ? action.station : station
      )
      return { ...state, stations: updatedStations }

    // When the filter criteria are updated
    case SET_FILTER_BY:
      return { ...state, filterBy: action.filterBy }

    // When the loading state is updated
    case SET_IS_LOADING:
      return { ...state, isLoading: action.isLoading }

    // When a new station is set as the currently played station
    case SET_CURRENTLY_PLAYED_STATION:
      return { 
        ...state, 
        currentlyPlayedStation: action.currentlyPlayedStation,  // Set the currently played station
        currentSongIndex: 0,  // Reset the current song index to 0
        songOrder: {
          currentSongURL: action.currentlyPlayedStation.songs[0] || '',  // Set the first song as the current song (if available)
          nextSongURL: action.currentlyPlayedStation.songs[1] || '',  // Set the second song as the next song (if available)
          prevSongURL: action.currentlyPlayedStation.songs[action.currentlyPlayedStation.songs.length - 1] || ''  // Set the last song as the previous song (if available)
        }
      }

    // When moving to the next song in the playlist
    case SET_NEXT_SONG:
      return { 
        ...state, 
        currentSongIndex: action.index,  // Update the current song index
        songOrder: {
          currentSongURL: state.currentlyPlayedStation.songs[action.index],  // Set the next song as the current song
          nextSongURL: state.currentlyPlayedStation.songs[action.index + 1] || state.currentlyPlayedStation.songs[0],  // Set the next song (or loop to the first song)
          prevSongURL: state.currentlyPlayedStation.songs[action.index - 1] || state.currentlyPlayedStation.songs[state.currentlyPlayedStation.songs.length - 1]  // Set the previous song (or loop to the last song)
        }
      }

    // When moving to the previous song in the playlist
    case SET_PREV_SONG:
      return { 
        ...state, 
        currentSongIndex: action.index,  // Update the current song index
        songOrder: {
          currentSongURL: state.currentlyPlayedStation.songs[action.index],  // Set the previous song as the current song
          nextSongURL: state.currentlyPlayedStation.songs[action.index + 1] || state.currentlyPlayedStation.songs[0],  // Set the next song (or loop to the first song)
          prevSongURL: state.currentlyPlayedStation.songs[action.index - 1] || state.currentlyPlayedStation.songs[state.currentlyPlayedStation.songs.length - 1]  // Set the previous song (or loop to the last song)
        }
      }

    // Default case: return the current state
    default:
      return state
  }
}
