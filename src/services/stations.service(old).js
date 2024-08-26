import { utilService as stationUtilService } from './util.service.js'
import { storageService as stationStorageService } from './async-storage.service.js'

const STATION_KEY = 'demoMainData'

_createStations()

export const stationService = {
  query,
  getCategoryById,
  getStationById,
  remove,
  save,
  getEmptyStation,
  getDefaultFilter,
  getFilterFromSearchParams,
  getCategoryStats,
  playStation,
  setNextPrevSong, // New function to handle next/prev song
  getItem,
}

// For Debug (easy access from console):
// window.cs = stationService

// Async query function to retrieve stations with filtering
async function query(filterBy = {}) {
  try {
    const stations = await stationStorageService.query(STATION_KEY)

    return
  } catch (error) {
    console.error('Error querying stations:', error)
    throw error
  }
}

// Async function to get a station category by ID
async function getCategoryById(categoryId) {
  try {
    let station = await stationStorageService.get(STATION_KEY, categoryId)
    station = await _setNextPrevStationId(station)
    return station
  } catch (error) {
    console.error('Error fetching category by ID:', error)
    throw error
  }
}

// Async function to get a station by its ID
async function getStationById(stationId) {
  try {
    const stations = await stationStorageService.query(STATION_KEY)
    let foundStation = null

    // Iterate over each station
    stations.forEach((station) => {
      // Iterate over each subCategory in the station
      Object.values(station.subCategory).forEach((subCategoryArray) => {
        // Find the station with the matching stationId in the subCategory array
        const stationItem = subCategoryArray.find(
          (item) => item.stationId === stationId
        )
        if (stationItem) {
          foundStation = stationItem
        }
      })
    })

    if (!foundStation) throw new Error('Station not found')
    return foundStation
  } catch (error) {
    console.error('Error fetching station by ID:', error)
    throw error
  }
}

// Async function to remove a station by its ID
async function remove(stationId) {
  try {
    return await stationStorageService.remove(STATION_KEY, stationId)
  } catch (error) {
    console.error('Error removing station:', error)
    throw error
  }
}

// Async function to save or update a station
async function save(station) {
  try {
    if (station._id) {
      station.updatedAt = Date.now()
      return await stationStorageService.put(STATION_KEY, station)
    } else {
      station.createdAt = station.updatedAt = Date.now()
      return await stationStorageService.post(STATION_KEY, station)
    }
  } catch (error) {
    console.error('Error saving station:', error)
    throw error
  }
}

// Function to get an empty station template
function getEmptyStation() {
  return {
    _id: '',
    title: '',
    songs: [{ artist: '', id: '', name: '', url: '', cover: '' }],
    cover: '',
    addedAt: Date.now(),
  }
}

// Function to get the default filter object
function getDefaultFilter() {
  return { txt: '' }
}

// Function to generate a filter object from search parameters
function getFilterFromSearchParams(searchParams) {
  const defaultFilter = getDefaultFilter()
  const filterBy = {}
  for (const field in defaultFilter) {
    filterBy[field] = searchParams.get(field) || ''
  }
  return filterBy
}

// Async function to get category statistics
async function getCategoryStats() {
  try {
    const stations = await stationStorageService.query(STATION_KEY)
    const stationCountBySubCategoryMap =
      _getStationCountBySubCategoryMap(stations)
    const data = Object.keys(stationCountBySubCategoryMap).map(
      (subCategoryName) => ({
        title: subCategoryName,
        value: stationCountBySubCategoryMap[subCategoryName],
      })
    )
    return data
  } catch (error) {
    console.error('Error fetching category stats:', error)
    throw error
  }
}

// Async function to play a station by ID
async function playStation(stationId) {
  try {
    const station = await getStationById(stationId)
    console.log('Station found:', station) // Log the station after it is resolved
    return station
  } catch (error) {
    console.error('Error fetching station:', error)
    throw error
  }
}

// Function to set next and previous songs for the currently played station
function setNextPrevSong(station, currentSongIndex) {
  const songCount = station.songs.length
  if (songCount === 0) return station // No songs available, return unchanged

  const nextSongIndex =
    currentSongIndex < songCount - 1 ? currentSongIndex + 1 : 0 // Loop to the first song if at the end
  const prevSongIndex =
    currentSongIndex > 0 ? currentSongIndex - 1 : songCount - 1 // Loop to the last song if at the beginning

  station.nextSong = station.songs[nextSongIndex]
  station.prevSong = station.songs[prevSongIndex]
  return station
}

// Create demo stations for initial setup
function _createStations() {}

// Helper function to gather all stations based on the filter
function gatherAllStations(stations, filterBy = {}) {
  let allStations = []

  // Iterate over each station entry
  stations.forEach((station) => {
    // Iterate over each subCategory in the current station
    Object.entries(station.subCategory).forEach(
      ([subCategoryKey, stationArray]) => {
        // If filterBy.subCategory exists, only include matching subCategories
        if (!filterBy.subCategory || subCategoryKey === filterBy.subCategory) {
          // If filterBy.txt exists, filter by text within the station title
          const filteredStations = stationArray.filter((item) => {
            if (filterBy.txt) {
              const regExp = new RegExp(filterBy.txt, 'i')
              return regExp.test(item.title)
            }
            return true // If no text filter, include all stations
          })

          // Combine the filtered stations into the allStations array
          allStations = allStations.concat(filteredStations)
        }
      }
    )
  })

  return allStations
}

// Helper function to set the next and previous station IDs
async function _setNextPrevStationId(station) {
  const stations = await stationStorageService.query(STATION_KEY)
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
}

// Helper function to count stations by subcategory
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

async function getItem(itemId) {
  try {
    const demoData = await stationStorageService.query(STATION_KEY)

    const items = []
    const stations = gatherAllStations(demoData)
    stations.map((station) => {
      station.songs.map((song) => {
        items.push(song)
      })
    })
    const item = items.find((item) => item.id === itemId)
    return item
  } catch (err) {
    console.log(err)
  }
}

/*

 const demoMainData = [
    {
      _id: '5lZfP',
      name: 'Pop Hits',
      category: 'Songs',
      subCategory: {
        popStation: [
          {
            stationId: 'CevxZvSJLk8',
            title: 'Katy Perry',
            songs: [
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=CevxZvSJLk8',
                songName: 'Roar',
                artist: 'Katy Perry',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=ScG0cCUgjTY',
                songName: 'Firework',
                artist: 'Katy Perry',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=0KSOMA3QBU0',
                songName: 'Dark Horse',
                artist: 'Katy Perry',
              },
            ],
            imgUrl: 'https://i.ytimg.com/vi/CevxZvSJLk8/mqdefault.jpg',
            addedAt: 1724180672981,
          },
          {
            stationId: '3AtDnEC4zak',
            title: 'Ed Sheeran',
            songs: [
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=3AtDnEC4zak',
                songName: 'Shape of You',
                artist: 'Ed Sheeran',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
                songName: 'Perfect',
                artist: 'Ed Sheeran',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=_dK2tDK9grQ',
                songName: 'Galway Girl',
                artist: 'Ed Sheeran',
              },
            ],
            imgUrl: 'https://i.ytimg.com/vi/3AtDnEC4zak/mqdefault.jpg',
            addedAt: 1724180672981,
          },
          {
            stationId: '2Vv-BfVoq4g',
            title: 'Ed Sheeran',
            songs: [
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
                songName: 'Thinking Out Loud',
                artist: 'Ed Sheeran',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=lp-EO5I60KA',
                songName: 'Photograph',
                artist: 'Ed Sheeran',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://www.youtube.com/watch?v=y83x7MgzWOA',
                songName: 'Castle on the Hill',
                artist: 'Ed Sheeran',
              },
            ],
            imgUrl: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
            addedAt: 1724180672981,
          },
        ],
        rockStation: [],
      },
    },
    {
      _id: 'IaHoi',
      name: 'Tech Talks',
      category: 'Podcasts',
      likedByUsers: ['5qACl', 'qTqFE', 'Klids', 'UXTCI'],
      subCategory: {
        technologyStation: [
          {
            stationId: '1',
            title: 'AI Experts',
            songs: [
              {
                id: stationUtilService.makeId(),
                url: 'https://podcast.com/episode1',
                songName: 'The Future of AI',
                artist: 'Tech Guru',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://podcast.com/episode2',
                songName: 'AI in Healthstatione',
                artist: 'Tech Guru',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://podcast.com/episode3',
                songName: 'Ethics of AI',
                artist: 'Tech Guru',
              },
            ],
            imgUrl: 'https://podcast.com/episode1.jpg',
            addedAt: 1724180672981,
          },
          {
            stationId: '2',
            title: 'Blockchain Explained',
            songs: [
              {
                id: stationUtilService.makeId(),
                url: 'https://podcast.com/episode2',
                songName: 'Blockchain 101',
                artist: 'Crypto Expert',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://podcast.com/episode3',
                songName: 'Smart Contracts',
                artist: 'Crypto Expert',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://podcast.com/episode4',
                songName: 'Decentralization',
                artist: 'Crypto Expert',
              },
            ],
            imgUrl: 'https://podcast.com/episode2.jpg',
            addedAt: 1724180672981,
          },
        ],
        innovationStation: [],
      },
    },
    {
      _id: 'fI3lq',
      name: 'Health Matters',
      category: 'Educational',
      likedByUsers: ['pvKz6', 'Qk0qZ'],
      subCategory: {
        healthStation: [
          {
            stationId: '4',
            title: 'Mental Health',
            songs: [
              {
                id: stationUtilService.makeId(),
                url: 'https://educational.com/lesson1',
                songName: 'Understanding Mental Health',
                artist: 'Health Coach',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://educational.com/lesson2',
                songName: 'Coping Strategies',
                artist: 'Health Coach',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://educational.com/lesson3',
                songName: 'Mindfulness',
                artist: 'Health Coach',
              },
            ],
            imgUrl: 'https://educational.com/lesson1.jpg',
            addedAt: 1724180672981,
          },
        ],
        wellnessStation: [
          {
            stationId: '5',
            title: 'Nutrition Basics',
            songs: [
              {
                id: stationUtilService.makeId(),
                url: 'https://educational.com/lesson2',
                songName: 'Healthy Eating',
                artist: 'Nutrition Expert',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://educational.com/lesson3',
                songName: 'Meal Planning',
                artist: 'Nutrition Expert',
              },
              {
                id: stationUtilService.makeId(),
                url: 'https://educational.com/lesson4',
                songName: 'Supplements',
                artist: 'Nutrition Expert',
              },
            ],
            imgUrl: 'https://educational.com/lesson2.jpg',
            addedAt: 1724180672981,
          },
        ],
      },
    },
  ]

  // Save the demo stations to the storage
  stationUtilService.saveToStorage(STATION_KEY, demoMainData)

*/
