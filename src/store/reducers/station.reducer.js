import { stationService } from '../../services/station.service'

// Action Types
export const SET_CURR_STATION = 'SET_CURR_STATION'
export const SET_STATIONS = 'SET_STATIONS'
export const REMOVE_STATION = 'REMOVE_STATION'
export const ADD_STATION = 'ADD_STATION'
export const UPDATE_STATION = 'UPDATE_STATION'
export const SET_FILTER_BY = 'SET_FILTER_BY'
export const SET_IS_LOADING = 'SET_IS_LOADING'
export const SET_CURR_ITEM = 'SET_CURR_ITEM'
export const SET_CURR_IDX = 'SET_CURR_IDX'
export const SET_IS_PLAYING = 'SET_IS_PLAYING'
export const SET_CURR_COLOR = 'SET_CURR_COLOR'
export const SET_LIKED_STATION = 'SET_LIKED_STATION'
export const SET_CURR_SEARCH = 'SET_CURR_SEARCH'
export const SET_IS_ACTIVE = 'SET_IS_ACTIVE'

const initialState = {
  stations: [],
  likedStation: {},
  currStation: stationService.getEmptyStation(),
  currItemIdx: 0,
  currItem: { name: '', artist: '', cover: '', url: '', id: '' },
  filterBy: stationService.getDefaultFilter(),
  isLoading: false,
  isPlaying: false,
  currColor: '#8e8be8',
  currSearch: '',
  isActive: false,
}

export function stationReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_STATIONS:
      return { ...state, stations: action.stations }

    case REMOVE_STATION:
      const newStations = state.stations.filter(
        (station) => station._id !== action.stationId
      )

      return { ...state, stations: newStations }

    case ADD_STATION:
      return { ...state, stations: [...state.stations, action.station] }

    case UPDATE_STATION:
      const updatedStations = state.stations.map((station) =>
        station._id === action.station._id ? action.station : station
      )
      return { ...state, stations: updatedStations }

    case SET_FILTER_BY:
      return { ...state, filterBy: action.filterBy }

    case SET_IS_LOADING:
      return { ...state, isLoading: action.isLoading }

    case SET_CURR_STATION:
      return {
        ...state,
        currStation: action.currStation,
      }

    case SET_CURR_ITEM:
      return {
        ...state,
        currItemIdx: action.currItemIdx,
        currItem: action.currItem,
      }
    case SET_CURR_IDX:
      return {
        ...state,
        currItemIdx: action.currItemIdx,
      }

    case SET_IS_PLAYING:
      return { ...state, isPlaying: action.isPlaying }

    case SET_CURR_COLOR:
      return { ...state, currColor: action.currColor }
    case SET_LIKED_STATION:
      return { ...state, likedStation: action.likedStation }
    case SET_CURR_SEARCH:
      return { ...state, currSearch: action.currSearch }
    case SET_IS_ACTIVE:
      return { ...state, isActive: action.isActive }

    default:
      return state
  }
}
