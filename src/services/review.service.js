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
        
        const stations = await stationHttpService.get(BASE_URL, filterBy);
        
        return stations;
    } catch (err) {
        console.error('Failed to fetch stations:', err);
        throw err; // Re-throw the error to be handled by the calling function
    }
}

async function getById(stationId) {
    try {
        
        const station = await stationHttpService.get(BASE_URL + stationId);
        
        return station;
    } catch (err) {
        console.error('Failed to fetch station:', err);
        throw err; // Re-throw the error to be handled by the calling function
    }
}

async function remove(stationId) {
    try {
        
        const result = await stationHttpService.delete(BASE_URL + stationId);
        
        return result;
    } catch (err) {
        console.error('Failed to remove station:', err);
        throw err; // Re-throw the error to be handled by the calling function
    }
}

async function save(station) {
    try {
        if (station._id) {
            
            const updatedStation = await stationHttpService.put(BASE_URL + station._id, station);
            
            return updatedStation;
        } else {
            
            const newStation = await stationHttpService.post(BASE_URL, station);
            
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
