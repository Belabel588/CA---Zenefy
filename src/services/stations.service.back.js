import { utilService as stationUtilService } from './util.service.js'
import { httpService as stationHttpService } from './http.service.js'

const BASE_URL = 'station/'

export const stationService = {
    query,
    getById,
    save,
    remove,
    getEmptyStation,
    getDefaultFilter,
    getFilterFromSearchParams,
    getCategoryStats
}

function query(filterBy = {}) {
    console.log('filterBy in station.service:', filterBy);
    return stationHttpService.get(BASE_URL, filterBy); // Adjusted to station context
}

function getById(stationId) {
    console.log(stationId);
    return stationHttpService.get(BASE_URL + stationId)
        .then(station => setNextPrevStationId(station));
}

function remove(stationId) {
    return stationHttpService.delete(BASE_URL + stationId);
}

function save(station) {
    if (station._id) {
        return stationHttpService.put(BASE_URL + station._id, station);
    } else {
        return stationHttpService.post(BASE_URL, station);
    }
}

function getEmptyStation() {
    const tags = ['Funk', 'Happy', 'Jazz', 'Rock', 'Pop', 'Classical'];
    const shuffledTags = stationUtilService.shuffleArray(tags);
    const selectedTags = shuffledTags.slice(0, 2);

    return {
        name: 'Station-' + (Date.now() % 1000),
        tags: selectedTags,
        createdBy: {
            _id: '', // To be filled with the user's id
            fullname: '',
            imgUrl: ''
        },
        likedByUsers: [],
        songs: [],
        msgs: [],
        createdAt: Date.now()
    };
}

function getDefaultFilter() {
    return { txt: '', tag: '', maxDuration: 0 };
}

function getCategoryStats() {
    return stationHttpService.get(BASE_URL)
        .then(stations => {
            const tagMap = stations.reduce((acc, station) => {
                station.tags.forEach(tag => {
                    if (!acc[tag]) acc[tag] = 0;
                    acc[tag]++;
                });
                return acc;
            }, {});

            return Object.keys(tagMap).map(tag => ({
                title: tag,
                value: tagMap[tag]
            }));
        });
}

function getFilterFromSearchParams(searchParams) {
    const defaultFilter = getDefaultFilter();
    const filterBy = {};
    for (const field in defaultFilter) {
        filterBy[field] = searchParams.get(field) || '';
    }
    return filterBy;
}

function setNextPrevStationId(station) {
    return query().then(stations => {
        const idx = stations.findIndex(currStation => currStation._id === station._id);
        station.nextStationId = stations[(idx + 1) % stations.length]._id;
        station.prevStationId = stations[(idx - 1 + stations.length) % stations.length]._id;
        return station;
    });
}
