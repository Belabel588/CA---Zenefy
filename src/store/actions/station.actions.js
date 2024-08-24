import { stationService } from '../../services/stations.service.js';
import {
  ADD_STATION,
  REMOVE_STATION,
  SET_IS_LOADING,
  SET_STATIONS,
  UPDATE_STATION,
  SET_CURRENTLY_PLAYED_STATION,
  SET_NEXT_SONG,
  SET_PREV_SONG,
} from '../reducers/station.reducer.js';
import { store } from '../store.js';

// Load stations from the service and dispatch them to the store
export async function loadStations() {
  const filterBy = store.getState().stationModule.filterBy; // Get current filter from state
  store.dispatch({ type: SET_IS_LOADING, isLoading: true }); // Set loading state to true

  try {
    // Fetch stations using the filter criteria
    const stations = await stationService.query(filterBy);
    // Dispatch stations to the store
    store.dispatch({ type: SET_STATIONS, stations });
  } catch (err) {
    console.error('Error loading stations:', err);
  } finally {
    // Set loading state to false
    store.dispatch({ type: SET_IS_LOADING, isLoading: false });
  }
}

// Remove a station by ID and update the store
export async function removeStation(stationId) {
  try {
    await stationService.remove(stationId);
    // Dispatch removal of station from the store
    store.dispatch({ type: REMOVE_STATION, stationId });
  } catch (err) {
    console.error('Error removing station:', err);
  }
}

// Save or update a station and dispatch the changes to the store
export async function saveStation(station) {
  try {
    const savedStation = await stationService.save(station);
    // Determine if it's an update or new station and dispatch accordingly
    const type = station._id ? UPDATE_STATION : ADD_STATION;
    store.dispatch({ type, station: savedStation });
  } catch (err) {
    console.error('Error saving station:', err);
  }
}

// Set the currently played station by station ID
export async function setCurrentlyPlayedStation(stationId) {
  try {
    // Fetch the station by ID from the service
    const station = await stationService.getStationById(stationId);
    // Dispatch the currently played station to the store
    store.dispatch({
      type: SET_CURRENTLY_PLAYED_STATION,
      currentlyPlayedStation: station,
    });
    return station; // Return the station for any further operations
  } catch (err) {
    console.error('Error setting currently played station:', err);
  }
}

// Set the next song in the playlist
export function setNextSong() {
  try {
    const { stationModule } = store.getState(); // Get current state
    const { currentSongIndex, currentlyPlayedStation } = stationModule;

    if (currentlyPlayedStation.songs.length > 1) {
      // Calculate the next song index
      const nextIndex = currentSongIndex < currentlyPlayedStation.songs.length - 1 
        ? currentSongIndex + 1 
        : 0; // Loop to the first song if at the end

      // Dispatch the action to set the next song
      store.dispatch({ type: SET_NEXT_SONG, index: nextIndex });
    }
  } catch (err) {
    console.error('Error setting next song:', err);
  }
}

// Set the previous song in the playlist
export function setPrevSong() {
  try {
    const { stationModule } = store.getState(); // Get current state
    const { currentSongIndex, currentlyPlayedStation } = stationModule;

    if (currentlyPlayedStation.songs.length > 1) {
      // Calculate the previous song index
      const prevIndex = currentSongIndex > 0 
        ? currentSongIndex - 1 
        : currentlyPlayedStation.songs.length - 1; // Loop to the last song if at the beginning

      // Dispatch the action to set the previous song
      store.dispatch({ type: SET_PREV_SONG, index: prevIndex });
    }
  } catch (err) {
    console.error('Error setting previous song:', err);
  }
}
