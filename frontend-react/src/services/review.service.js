import { httpService as stationHttpService } from './http.service.js'
import { utilService as stationUtilService } from './util.service.js'

const BASE_URL = 'station/'

export const reviewService = {
    query,
    getById,
    save,
    remove,
    getEmptyStation
}

async function query(filterBy = {}) {
    try {
        console.log('filterBy in station.service:', filterBy);
        const stations = await stationHttpService.get(BASE_URL, filterBy);
        console.log('Stations from backend:', stations);
        return stations;
    } catch (err) {
        console.error('Failed to fetch stations:', err);
        throw err; // Re-throw the error to be handled by the calling function
    }
}

async function getById(stationId) {
    try {
        console.log('Fetching station with ID:', stationId);
        const station = await stationHttpService.get(BASE_URL + stationId);
        console.log('Fetched station:', station);
        return station;
    } catch (err) {
        console.error('Failed to fetch station:', err);
        throw err; // Re-throw the error to be handled by the calling function
    }
}

async function remove(stationId) {
    try {
        console.log('Removing station with ID:', stationId);
        const result = await stationHttpService.delete(BASE_URL + stationId);
        console.log('Removed station:', result);
        return result;
    } catch (err) {
        console.error('Failed to remove station:', err);
        throw err; // Re-throw the error to be handled by the calling function
    }
}

async function save(station) {
    try {
        if (station._id) {
            console.log('Updating station:', station);
            const updatedStation = await stationHttpService.put(BASE_URL + station._id, station);
            console.log('Updated station:', updatedStation);
            return updatedStation;
        } else {
            console.log('Adding new station:', station);
            const newStation = await stationHttpService.post(BASE_URL, station);
            console.log('Added station:', newStation);
            return newStation;
        }
    } catch (err) {
        console.error('Failed to save station:', err);
        throw err; // Re-throw the error to be handled by the calling function
    }
}

function getEmptyStation() {
    return {
        name: '',
        tags: [],
        createdBy: {
            _id: '',
            fullname: '',
            imgUrl: '',
        },
        likedByUsers: [],
        songs: [],
        msgs: []
    };
}
