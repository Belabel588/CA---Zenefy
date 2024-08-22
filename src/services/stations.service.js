import { utilService as stationUtilService } from './util.service.js'
import { storageService as stationStorageService } from './async-storage.service.js'

const STATION_KEY = 'demoStations'

_createStations()

export const stationService = {
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
  return stationStorageService.query(STATION_KEY).then((stations) => {
    if (filterBy.tag) {
      stations = stations.filter((station) =>
        station.tags.includes(filterBy.tag)
      )
    }
    if (filterBy.txt) {
      const regExp = new RegExp(filterBy.txt, 'i')
      stations = stations.filter((station) => regExp.test(station.name))
    }

    return stations
  })
}

function getById(stationId) {
  return stationStorageService.get(STATION_KEY, stationId).then((station) => {
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
      imgUrl: '',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
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
  return stationStorageService.query(STATION_KEY).then((stations) => {
    const stationCountByTagMap = _getStationCountByTagMap(stations)
    const data = Object.keys(stationCountByTagMap).map((tagName) => ({
      title: tagName,
      value: stationCountByTagMap[tagName],
    }))
    return data
  })
}

function _createStations() {
  const demoStations = [
    {
      _id: '5lZfP',
      name: 'Pop Hits',
      tags: ['Pop', 'Funk'],
      createdBy: {
        _id: 'uY7JC',
        fullname: 'Demo User',
        imgUrl: 'http://some-photo-url.com',
      },
      likedByUsers: ['TmJoX', 'hIT9J'],
      category: 'Songs',
      createdAt: 1724180672981,
      updatedAt: 1724180672981,
      stations: [
        {
          id: 'CevxZvSJLk8',
          title: 'Katy Perry',
          url: [
            'https://www.youtube.com/watch?v=CevxZvSJLk8',
            'https://www.youtube.com/watch?v=ScG0cCUgjTY',
            'https://www.youtube.com/watch?v=0KSOMA3QBU0',
          ],
          imgUrl: 'https://i.ytimg.com/vi/CevxZvSJLk8/mqdefault.jpg',
          addedAt: 1724180672981,
        },
        {
          id: '3AtDnEC4zak',
          title: 'Ed Sheeran',
          url: [
            'https://www.youtube.com/watch?v=3AtDnEC4zak',
            'https://www.youtube.com/watch?v=JGwWNGJdvx8',
            'https://www.youtube.com/watch?v=_dK2tDK9grQ',
          ],
          imgUrl: 'https://i.ytimg.com/vi/3AtDnEC4zak/mqdefault.jpg',
          addedAt: 1724180672981,
        },
        {
          id: '2Vv-BfVoq4g',
          title: 'Ed Sheeran',
          url: [
            'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
            'https://www.youtube.com/watch?v=lp-EO5I60KA',
            'https://www.youtube.com/watch?v=y83x7MgzWOA',
          ],
          imgUrl: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
          addedAt: 1724180672981,
        },
      ],
    },
    {
      _id: 'IaHoi',
      name: 'Tech Talks',
      tags: ['Technology', 'Innovation'],
      createdBy: {
        _id: 'w3BaO',
        fullname: 'Demo User',
        imgUrl: 'http://some-photo-url.com',
      },
      likedByUsers: ['5qACl', 'qTqFE', 'Klids', 'UXTCI'],
      category: 'Podcasts',
      createdAt: 1724180672981,
      updatedAt: 1724180672981,
      stations: [
        {
          id: '1',
          title: 'AI Experts',
          url: [
            'https://podcast.com/episode1',
            'https://podcast.com/episode2',
            'https://podcast.com/episode3',
          ],
          imgUrl: 'https://podcast.com/episode1.jpg',
          addedAt: 1724180672981,
        },
        {
          id: '2',
          title: 'Blockchain Explained',
          url: [
            'https://podcast.com/episode2',
            'https://podcast.com/episode3',
            'https://podcast.com/episode4',
          ],
          imgUrl: 'https://podcast.com/episode2.jpg',
          addedAt: 1724180672981,
        },
      ],
    },
    {
      _id: 'fI3lq',
      name: 'Health Matters',
      tags: ['Health', 'Wellness'],
      createdBy: {
        _id: '8wSj2',
        fullname: 'Demo User',
        imgUrl: 'http://some-photo-url.com',
      },
      likedByUsers: ['pvKz6', 'Qk0qZ'],
      category: 'Educational',
      createdAt: 1724180672981,
      updatedAt: 1724180672981,
      stations: [
        {
          id: '4',
          title: 'Mental Health',
          url: [
            'https://educational.com/lesson1',
            'https://educational.com/lesson2',
            'https://educational.com/lesson3',
          ],
          imgUrl: 'https://educational.com/lesson1.jpg',
          addedAt: 1724180672981,
        },
        {
          id: '5',
          title: 'Nutrition Basics',
          url: [
            'https://educational.com/lesson2',
            'https://educational.com/lesson3',
            'https://educational.com/lesson4',
          ],
          imgUrl: 'https://educational.com/lesson2.jpg',
          addedAt: 1724180672981,
        },
      ],
    },
  ]

  // Save the demo stations to the storage
  stationUtilService.saveToStorage(STATION_KEY, demoStations)
}

function _setNextPrevStationId(station) {
  return stationStorageService.query(STATION_KEY).then((stations) => {
    const stationIdx = stations.findIndex(
      (currStation) => currStation._id === station._id
    )
    const nextStation = stations[stationIdx + 1]
      ? stations[stationIdx + 1]
      : stations[0]
    const prevStation = stations[stationIdx - 1]
      ? stations[stationIdx - 1]
      : stations[stations.length - 1]
    station.nextStationId = nextStation._id
    station.prevStationId = prevStation._id
    return station
  })
}

function _getStationCountByTagMap(stations) {
  const stationCountByTagMap = stations.reduce((map, station) => {
    station.tags.forEach((tag) => {
      if (!map[tag]) map[tag] = 0
      map[tag]++
    })
    return map
  }, {})
  return stationCountByTagMap
}
