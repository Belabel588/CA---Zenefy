import { stationService } from '../../services/station.service.js'
import {
  SET_STATIONS,
  ADD_STATION,
  REMOVE_STATION,
  UPDATE_STATION,
  SET_CURR_STATION,
  SET_IS_LOADING,
  SET_IS_PLAYING,
  SET_CURR_ITEM,
  SET_CURR_IDX,
} from '../reducers/station.reducer.js'
import { store } from '../store.js'

export async function loadStations() {
  const filterBy = store.getState().stationModule.filterBy
  store.dispatch({ type: SET_IS_LOADING, isLoading: true })

  console.log('filterBy IN ACTIONS IS : ' , filterBy);

  try {
    const stations = await stationService.query(filterBy)
    store.dispatch({ type: SET_STATIONS, stations })
  } catch (err) {
    console.error('Error loading stations:', err)
  } finally {
    store.dispatch({ type: SET_IS_LOADING, isLoading: false })
  }
}

export async function removeStation(stationId) {
  try {
    await stationService.remove(stationId)
    store.dispatch({ type: REMOVE_STATION, stationId })
  } catch (err) {
    console.error('Error removing station:', err)
  }
}

export async function saveStation(station) {
  try {
    const savedStation = await stationService.save(station)
    const type = station._id ? UPDATE_STATION : ADD_STATION

    store.dispatch({ type, station: savedStation })
  } catch (err) {
    console.error('Error saving station:', err)
  }
}

export async function setCurrStation(stationId) {
  try {
    const station = await stationService.getById(stationId)

    store.dispatch({
      type: SET_CURR_STATION,
      currStation: station,
    })

    return station
  } catch (err) {
    console.error('Error setting currently played station:', err)
  }
}

export async function setCurrItem(itemId, currStation) {
  if (itemId) {
    // later will get item from search
    const item = currStation.items.find((item) => item.id === itemId)
    const idx = currStation.items.findIndex((item) => item.id === itemId)
    store.dispatch({ type: SET_CURR_ITEM, currItem: item, currItemIdx: idx })
  } else {
    const item = currStation.items[0]
    store.dispatch({ type: SET_CURR_ITEM, currItem: item, currItemIdx: 0 })
  }
}

export function setCurrItemIdx(itemIdx) {
  store.dispatch({ type: SET_CURR_IDX, currItemIdx: itemIdx })
}

export function setIsPlaying(isPlayingToSet) {
  store.dispatch({ type: SET_IS_PLAYING, isPlaying: isPlayingToSet })
}
