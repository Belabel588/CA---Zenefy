import { stationService } from '../../services/stations.service.js'
import {
  ADD_STATION,
  REMOVE_STATION,
  SET_IS_LOADING,
  SET_STATIONS,
  UPDATE_STATION,
  SET_CURRENTLY_PLAYED_STATION,
  SET_NEXT_SONG,
  SET_PREV_SONG,
} from '../reducers/station.reducer.js'
import { store } from '../store.js'

// Load stations from the service and dispatch them to the store
export async function loadStations() {
  const filterBy = store.getState().stationModule.filterBy // Get current filter from state
  store.dispatch({ type: SET_IS_LOADING, isLoading: true }) // Set loading state to true

  try {
    // Fetch stations using the filter criteria
    const stations = await stationService.query(filterBy)
    // Dispatch stations to the store
    store.dispatch({ type: SET_STATIONS, stations })
  } catch (err) {
    console.error('Error loading stations:', err)
  } finally {
    // Set loading state to false
    store.dispatch({ type: SET_IS_LOADING, isLoading: false })
  }
}

// Remove a station by ID and update the store
export async function removeStation(stationId) {
  try {
    await stationService.remove(stationId)
    // Dispatch removal of station from the store
    store.dispatch({ type: REMOVE_STATION, stationId })
  } catch (err) {
    console.error('Error removing station:', err)
  }
}

// Save or update a station and dispatch the changes to the store
export async function saveStation(station) {
  try {
    const savedStation = await stationService.save(station)
    // Determine if it's an update or new station and dispatch accordingly
    const type = station._id ? UPDATE_STATION : ADD_STATION
    store.dispatch({ type, station: savedStation })
  } catch (err) {
    console.error('Error saving station:', err)
  }
}

// Set the currently played station by station ID
export async function setCurrentlyPlayedStation(stationId) {
  try {
    const station = await stationService.getStationById(stationId);
    
    // Assume the first song in the station is the one to start with
    const firstSong = station.songs[0];
    const nextSong = station.songs[1] || null;
    const prevSong = station.songs[station.songs.length - 1] || null;
    
    store.dispatch({
      type: SET_CURRENTLY_PLAYED_STATION,
      currentlyPlayedStation: station,
      songOrder: {
        currentSong: firstSong,
        nextSong: nextSong,
        prevSong: prevSong
      }
    });
    
    return station;
  } catch (err) {
    console.error('Error setting currently played station:', err);
  }
}


// Set the next song in the playlist
export function setNextSong() {
  const state = store.getState().stationModule;
  const { currentlyPlayedStation, songOrder } = state;
  const currentSongIndex = currentlyPlayedStation.songs.findIndex(
    song => song.id === songOrder.currentSong.id
  );
  
  const nextSongIndex = (currentSongIndex + 1) % currentlyPlayedStation.songs.length;
  const nextSong = currentlyPlayedStation.songs[nextSongIndex];
  const prevSong = currentlyPlayedStation.songs[currentSongIndex];  // Current song becomes previous

  store.dispatch({
    type: SET_NEXT_SONG,
    songOrder: {
      currentSong: nextSong,
      nextSong: currentlyPlayedStation.songs[nextSongIndex + 1] || currentlyPlayedStation.songs[0],
      prevSong: prevSong
    }
  });
}


// Set the previous song in the playlist
export function setPrevSong() {
  const state = store.getState().stationModule;
  const { currentlyPlayedStation, currentSongIndex } = state;

  // Calculate the previous song index and wrap around using modulo
  const prevSongIndex = (currentSongIndex - 1 + currentlyPlayedStation.songs.length) % currentlyPlayedStation.songs.length;
  
  const prevSong = currentlyPlayedStation.songs[prevSongIndex];
  const nextSong = currentlyPlayedStation.songs[currentSongIndex];  // Current song becomes next

  store.dispatch({
    type: SET_PREV_SONG,
    songOrder: {
      currentSong: prevSong,
      nextSong: nextSong,
      prevSong: currentlyPlayedStation.songs[prevSongIndex - 1] || currentlyPlayedStation.songs[currentlyPlayedStation.songs.length - 1]
    },
    index: prevSongIndex  // Update the current song index
  });
}

