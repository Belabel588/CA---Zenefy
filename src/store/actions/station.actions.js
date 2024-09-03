import { FastAverageColor } from 'fast-average-color'

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
  SET_CURR_COLOR,
  SET_LIKED_STATION,
  SET_CURR_SEARCH,
  SET_IS_ACTIVE,
} from '../reducers/station.reducer.js'
import { store } from '../store.js'

export async function loadStations() {
  const filterBy = store.getState().stationModule.filterBy

  store.dispatch({ type: SET_IS_LOADING, isLoading: true })

  try {
    const stations = await stationService.query(filterBy)
    const loggedInUser = store.getState().userModule.loggedinUser
    if (!loggedInUser) {
      store.dispatch({ type: SET_STATIONS, stations })
    } else {
      const stationIds = loggedInUser.likedStationsIds
      let userStations
      if (stationIds && stationIds.length > 0) {
        userStations = stations.filter((station) =>
          loggedInUser.likedStationsIds.includes(station._id)
        )
      } else {
        userStations = []
      }

      store.dispatch({ type: SET_STATIONS, stations: userStations })
    }
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
    return savedStation
  } catch (err) {
    console.error('Error saving station:', err)
  }
}

export async function setCurrStation(stationId) {
  try {
    const station = await stationService.getById(stationId)
    const stationToSet = { ...station }
    store.dispatch({
      type: SET_CURR_STATION,
      currStation: { ...stationToSet },
    })

    return station
  } catch (err) {
    console.error('Error setting currently played station:', err)
  }
}

export async function setCurrItem(itemId, currStation, isDoubleClick = false) {
  if (itemId) {
    // later will get item from search
    const item = currStation.items.find((item) => item.id === itemId)
    if (isDoubleClick) {
      const itemToSet = { ...item }
      const idx = currStation.items.findIndex((item) => item.id === itemId)
      store.dispatch({
        type: SET_CURR_ITEM,
        currItem: itemToSet,
        currItemIdx: idx,
      })
      return
    }

    const idx = currStation.items.findIndex((item) => item.id === itemId)
    store.dispatch({
      type: SET_CURR_ITEM,
      currItem: item,
      currItemIdx: idx,
    })
  } else {
    const item = currStation.items[0]

    store.dispatch({
      type: SET_CURR_ITEM,
      currItem: { ...item },
      currItemIdx: 0,
    })
  }
}

export function setCurrItemIdx(itemIdx) {
  store.dispatch({ type: SET_CURR_IDX, currItemIdx: itemIdx })
}

export function setIsPlaying(isPlayingToSet) {
  store.dispatch({ type: SET_IS_PLAYING, isPlaying: isPlayingToSet })
}

export async function setCurrColor(
  cover = 'https://i.scdn.co/image/ab67706c0000da849d25907759522a25b86a3033'
) {
  try {
    const fac = new FastAverageColor()
    let color

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = cover
    color = await fac.getColorAsync(img)
    const hex = color.hex
    console.log(hex)

    store.dispatch({ type: SET_CURR_COLOR, currColor: hex })
    return hex
  } catch (err) {
    console.log(err)
  }
}

export function setIsLoading(isLoading) {
  store.dispatch({ type: SET_IS_LOADING, isLoading })
}
export function setCurrSearch(term) {
  store.dispatch({ type: SET_CURR_SEARCH, currSearch: term })
}

export function setIsActive(stateToSet) {
  store.dispatch({ type: SET_IS_ACTIVE, isActive: stateToSet })
}
