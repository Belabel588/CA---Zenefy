import { utilService as stationUtilService } from './util.service.js'
import { storageService as stationStorageService } from './async-storage.service.js'

const STATION_KEY = 'demoMainData'

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
    // Check if filterBy is empty (no filter conditions)
    console.log(filterBy);

    if (Object.keys(filterBy).length === 0) {
      // If filterBy is empty, return all stations combined
      const allStations = gatherAllStations(stations);
      console.log('All Stations:', allStations);
      return allStations;
    }

    // If filterBy has criteria, gather stations according to the filter
    const filteredStations = gatherAllStations(stations, filterBy);
    console.log('Filtered Stations:', filteredStations);
    return filteredStations;
  });
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

function getEmptyStation(name = '', subCategory = {}) {
  return {
    name,
    subCategory,
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
  return { txt: '', subCategory: '' }
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
    const stationCountBySubCategoryMap = _getStationCountBySubCategoryMap(stations)
    const data = Object.keys(stationCountBySubCategoryMap).map((subCategoryName) => ({
      title: subCategoryName,
      value: stationCountBySubCategoryMap[subCategoryName],
    }))
    return data
  })
}

function _createStations() {

  const demoMainData = [
    {
      _id: "5lZfP",
      name: "Pop Hits",
      category: "Songs",
      subCategory: {
        popStation: [
          {
            id: "CevxZvSJLk8",
            title: "Katy Perry",
            songs: [
              "https://www.youtube.com/watch?v=CevxZvSJLk8",
              "https://www.youtube.com/watch?v=ScG0cCUgjTY",
              "https://www.youtube.com/watch?v=0KSOMA3QBU0"
            ],
            imgUrl: "https://i.ytimg.com/vi/CevxZvSJLk8/mqdefault.jpg",
            addedAt: 1724180672981,
          },
          {
            id: "3AtDnEC4zak",
            title: "Ed Sheeran",
            songs: [
              "https://www.youtube.com/watch?v=3AtDnEC4zak",
              "https://www.youtube.com/watch?v=JGwWNGJdvx8",
              "https://www.youtube.com/watch?v=_dK2tDK9grQ"
            ],
            imgUrl: "https://i.ytimg.com/vi/3AtDnEC4zak/mqdefault.jpg",
            addedAt: 1724180672981,
          },
          {
            id: "2Vv-BfVoq4g",
            title: "Ed Sheeran",
            songs: [
              "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
              "https://www.youtube.com/watch?v=lp-EO5I60KA",
              "https://www.youtube.com/watch?v=y83x7MgzWOA"
            ],
            imgUrl: "https://i.ytimg.com/vi/2Vv-BfVoq4g/mqdefault.jpg",
            addedAt: 1724180672981,
          },
        ],
        rockStation: []
      }
    },
    {
      _id: "IaHoi",
      name: "Tech Talks",
      category: "Podcasts",
      likedByUsers: ["5qACl", "qTqFE", "Klids", "UXTCI"],
      subCategory: {
        technologyStation: [
          {
            id: "1",
            title: "AI Experts",
            songs: [
              "https://podcast.com/episode1",
              "https://podcast.com/episode2",
              "https://podcast.com/episode3"
            ],
            imgUrl: "https://podcast.com/episode1.jpg",
            addedAt: 1724180672981,
          },
          {
            id: "2",
            title: "Blockchain Explained",
            songs: [
              "https://podcast.com/episode2",
              "https://podcast.com/episode3",
              "https://podcast.com/episode4"
            ],
            imgUrl: "https://podcast.com/episode2.jpg",
            addedAt: 1724180672981,
          },
        ],
        innovationStation: []
      }
    },
    {
      _id: "fI3lq",
      name: "Health Matters",
      category: "Educational",
      likedByUsers: ["pvKz6", "Qk0qZ"],
      subCategory: {
        healthStation: [
          {
            id: "4",
            title: "Mental Health",
            songs: [
              "https://educational.com/lesson1",
              "https://educational.com/lesson2",
              "https://educational.com/lesson3"
            ],
            imgUrl: "https://educational.com/lesson1.jpg",
            addedAt: 1724180672981,
          }
        ],
        wellnessStation: [
          {
            id: "5",
            title: "Nutrition Basics",
            songs: [
              "https://educational.com/lesson2",
              "https://educational.com/lesson3",
              "https://educational.com/lesson4"
            ],
            imgUrl: "https://educational.com/lesson2.jpg",
            addedAt: 1724180672981,
          }
        ]
      }
    }
  ]

  // Save the demo stations to the storage
  stationUtilService.saveToStorage(STATION_KEY, demoMainData);
}

function gatherAllStations(stations, filterBy = {}) {
  let allStations = [];
  console.log(filterBy);

  // Iterate over each station entry
  stations.forEach((station) => {
    // Iterate over each subCategory in the current station
    Object.entries(station.subCategory).forEach(([subCategoryKey, stationArray]) => {
      // If filterBy.subCategory exists, only include matching subCategories
      if (!filterBy.subCategory || subCategoryKey === filterBy.subCategory) {
        // If filterBy.txt exists, filter by text within the station title
        const filteredStations = stationArray.filter((item) => {
          if (filterBy.txt) {
            const regExp = new RegExp(filterBy.txt, 'i');
            return regExp.test(item.title);
          }
          return true; // If no text filter, include all stations
        });

        // Combine the filtered stations into the allStations array
        allStations = allStations.concat(filteredStations);
      }
    });
  });
  console.log(allStations);

  return allStations;
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

function _getStationCountBySubCategoryMap(stations) {
  const stationCountBySubCategoryMap = stations.reduce((map, station) => {
    Object.keys(station.subCategory).forEach((subCategory) => {
      if (!map[subCategory]) map[subCategory] = 0
      map[subCategory]++
    })
    return map
  }, {})
  return stationCountBySubCategoryMap
}
