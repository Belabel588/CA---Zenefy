import { utilService as stationUtilService } from './util.service.js'
import { storageService as stationStorageService } from './async-storage.service.js'

const STATION_KEY = 'stationDB'
_createStations()

export const stationLocalService = {
    query,
    getById,
    remove,
    save,
    getEmptyStation,
    getDefaultFilter,
    getFilterFromSearchParams,
    getCategoryStats,
}
// For Debug (easy access from console):
// window.cs = stationService

function query(filterBy = {}) {
    return stationStorageService.query(STATION_KEY)
        .then(stations => {
            if (filterBy.tag) {
                stations = stations.filter(station => station.tags.includes(filterBy.tag))
            }
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                stations = stations.filter(station => regExp.test(station.name))
            }

            return stations
        })
}

function getById(stationId) {
    return stationStorageService.get(STATION_KEY, stationId)
        .then(station => {
            station = _setNextPrevStationId(station)
            return station
        })
}

function remove(stationId) {
    return stationStorageService.remove(STATION_KEY, stationId)
}

function save(station) {
    if (station._id) {
        station.updatedAt = Date.now()
        return stationStorageService.put(STATION_KEY, station)
    } else {
        station.createdAt = station.updatedAt = Date.now()
        return stationStorageService.post(STATION_KEY, station)
    }
}

function getEmptyStation(name = '', tags = []) {
    return { 
        name, 
        tags, 
        songs: [], 
        likedByUsers: [], 
        msgs: [], 
        createdBy: {
            _id: '', 
            fullname: '', 
            imgUrl: ''
        },
        createdAt: Date.now(), 
        updatedAt: Date.now() 
    }
}

function getDefaultFilter() {
    return { txt: '', tag: '' }
}

function getFilterFromSearchParams(searchParams) {
    const defaultFilter = getDefaultFilter()
    const filterBy = {}
    for (const field in defaultFilter) {
        filterBy[field] = searchParams.get(field) || ''
    }
    return filterBy
}

function getCategoryStats() {
    return stationStorageService.query(STATION_KEY)
        .then(stations => {
            const stationCountByTagMap = _getStationCountByTagMap(stations)
            const data = Object.keys(stationCountByTagMap).map(tagName => ({ title: tagName, value: stationCountByTagMap[tagName] }))
            return data
        })
}

function _createStations() {
    let stations = stationUtilService.loadFromStorage(STATION_KEY)
    if (!stations || !stations.length) {
        stations = []
        const names = ['Funky Monks', 'Classic Vibes', 'Jazz Masters']
        const tags = [
            ['Funk', 'Happy'],
            ['Classical', 'Relaxing'],
            ['Jazz', 'Smooth']
        ]
        for (let i = 0; i < 10; i++) {
            const name = names[stationUtilService.getRandomIntInclusive(0, names.length - 1)]
            const stationTags = tags[stationUtilService.getRandomIntInclusive(0, tags.length - 1)]
            stations.push(_createStation(name + ' ' + (i + 1), stationTags))
        }
        stationUtilService.saveToStorage(STATION_KEY, stations)
    }
}

function _createStation(name, tags) {
    const station = getEmptyStation(name, tags)
    station._id = stationUtilService.makeId()
    station.createdAt = station.updatedAt = Date.now() - stationUtilService.getRandomIntInclusive(0, 1000 * 60 * 60 * 24)
    return station
}

function _setNextPrevStationId(station) {
    return stationStorageService.query(STATION_KEY).then((stations) => {
        const stationIdx = stations.findIndex((currStation) => currStation._id === station._id)
        const nextStation = stations[stationIdx + 1] ? stations[stationIdx + 1] : stations[0]
        const prevStation = stations[stationIdx - 1] ? stations[stationIdx - 1] : stations[stations.length - 1]
        station.nextStationId = nextStation._id
        station.prevStationId = prevStation._id
        return station
    })
}

function _getStationCountByTagMap(stations) {
    const stationCountByTagMap = stations.reduce((map, station) => {
        station.tags.forEach(tag => {
            if (!map[tag]) map[tag] = 0
            map[tag]++
        })
        return map
    }, {})
    return stationCountByTagMap
}

// Data Model:
// const station = {
//     _id: "s101",
//     name: "Funky Monks",
//     tags: ["Funk", "Happy"],
//     createdBy: {
//         _id: "u101",
//         fullname: "Puki Ben David",
//         imgUrl: "http://some-photo/"
//     },
//     likedByUsers: ['u102', 'u103'],
//     songs: [
//         {
//             id: "s1001",
//             title: "The Meters - Cissy Strut",
//             url: "youtube/song.mp4",
//             imgUrl: "https://i.ytimg.com/vi/4_iC0MyIykM/mqdefault.jpg",
//             addedBy: "u101",
//             likedBy: ["u102", "u103"],
//             addedAt: 162521765262
//         }
//     ],
//     msgs: [
//         {
//             id: "m101",
//             from: "u102",
//             txt: "Great station!"
//         }
//     ],
//     createdAt: 1631031801011,
//     updatedAt: 1631031801011
// }
