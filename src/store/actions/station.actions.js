import { stationService } from "../services/station.service.js";
import { ADD_STATION, REMOVE_STATION, SET_IS_LOADING, SET_STATIONS, UPDATE_STATION } from "./reducers/station.reducer.js";
import { store } from "../store.js";

export async function loadStations() {

    const filterBy = store.getState().stationModule.filterBy;

    store.dispatch({ type: SET_IS_LOADING, isLoading: true });

    try {
        const stations = await stationService.query(filterBy);
        store.dispatch({ type: SET_STATIONS, stations });
    } catch (err) {
        console.log(err);
    } finally {
        store.dispatch({ type: SET_IS_LOADING, isLoading: false });
    }
}

export function removeStation(stationId) {
    return stationService.remove(stationId)
        .then(() => store.dispatch({ type: REMOVE_STATION, stationId }));
}

export function saveStation(station) {
    const type = station._id ? UPDATE_STATION : ADD_STATION;
    return stationService.save(station)
        .then(savedStation => store.dispatch({ type, station: savedStation }));
}
