import { httpService } from './http.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'

const STORAGE_KEY = 'station'

export const stationService = {
  query,
  getById,
  save,
  remove,
  addStationMsg,
  getItem,
  getItemsStation,
  getStationData,
  createStationFromSearch,
  likeSong,
  getCategoriesWithImages,
}

async function query(filterBy = { txt: '', price: 0 }) {
  return httpService.get(STORAGE_KEY, filterBy)
}

function getById(stationId) {
  return httpService.get(`${STORAGE_KEY}/${stationId}`)
}

async function remove(stationId) {
  return httpService.delete(`${STORAGE_KEY}/${stationId}`)
}
async function save(station) {
  var savedStation
  if (station._id) {
    savedStation = await httpService.put(
      `${STORAGE_KEY}/${station._id}`,
      station
    )
  } else {
    savedStation = await httpService.post(STORAGE_KEY, station)
  }
  return savedStation
}

async function addStationMsg(stationId, txt) {
  const savedMsg = await httpService.post(`${STORAGE_KEY}/${stationId}/msg`, {
    txt,
  })
  return savedMsg
}

async function getItem(itemId) {
  try {
    var stations = await query()
    let item
    stations.map((station) => {
      if (item) return
      item = station.items.find((item) => item.id === itemId)
    })

    return item
  } catch (err) {
    console.log(err)
  }
}

async function getItemsStation(itemId) {
  var stations = await query()

  let stationToReturn
  stations.map((station) => {
    if (stationToReturn) return
    station.items.map((item) => {
      if (item.id === itemId) {
        stationToReturn = station
      }
    })
  })
  return stationToReturn
}

async function getStationData(stationId) {
  const stations = await query()
  const foundStation = stations.find((station) => station._id === stationId)

  if (!foundStation) {
    return {
      stationsWithSameType: [],
      combinedTags: [],
    }
  }

  const stationsWithSameType = stations.filter(
    (station) => station.stationType === foundStation.stationType
  )
  const combinedTags = stationsWithSameType
    .map((station) => station.tags)
    .flat()

  return {
    stationsWithSameType,
    combinedTags,
  }
}

async function createStationFromSearch(searchResults, keyWord) {
  // Create a new station object
  const user = userService.getLoggedinUser()

  const station = {
    keyWord,
    isSearched: true,
    stationType: searchResults.stationType || 'music', // Assuming the station type is always 'music'
    title: searchResults[0]?.artist || 'Untitled Station', // Use the artist's name as the station title, fallback to 'Untitled Station'
    items: searchResults.map((result) => ({
      artist: result.artist,
      id: result.id, // Generate a unique ID for each item
      name: result.name,
      album: result.album,
      url: result.url,
      cover: result.cover,
      addedBy: 'user1', // Assuming a default user, replace with actual user ID if available
      likedBy: [], // Empty likedBy array
      addedAt: Date.now(), // Current timestamp
      lyrics: result.lyrics,
      duration: result.duration || '00:00',
    })),
    cover: searchResults[0]?.cover || 'default_cover_url', // Use the first song's cover as the station cover, fallback to a default URL
    tags: [], // Empty tags array
    createdBy: {
      fullname: searchResults[0]?.artist || 'Unknown Artist', // Use the artist's name
      imgUrl: searchResults[0]?.cover || 'default_artist_image_url', // Use the artist's cover as their image, fallback to a default URL
    },
    likedByUsers: [], // Empty likedByUsers array
    addedAt: Date.now(), // Current timestamp
  }

  return station
}

async function likeSong(itemToAdd) {
  if (itemToAdd.url === '') return
  if (!user) return

  try {
    const user = await userService.getLoggedinUser()
    const stations = await query()
    const likedStation = stations.find(
      (station) => station.isLiked && station.createdBy._id === user._id
    )

    likedStation.items.push(itemToAdd)
    await saveStation(likedStation)
    const likedSongsIds = user.likedSongsIds
    likedSongsIds.push(itemToAdd.id)
    const userToSave = { ...user, likedSongsIds }
    await updateUser(userToSave)
    setLikedStation()
  } catch (err) {
    console.log(err)
  }
}

function getCategoriesWithImages() {
  const categories = [
    'Podcasts',
    'Made for you',
    'New releases',
    'Pop',
    'Hip-Hop',
    'Rock',
    'Latin',
    'Educational',
    'Documentary',
    'Comedy',
    'Dance Electric',
    'Mood',
    'Indie',
    'Workout',
    'Discover',
    'Country',
    'R&B',
    'K-pop',
    'Chill',
    'Sleep',
    'Party',
    'At home',
    'Love',
    'Metal',
    'Jazz',
    'Trending',
    'Anime',
    'Gaming',
    'Folk & Acoustic',
    'Focus',
    'Kids & Family',
    'Classical',
    'Instrumental',
    'Punk',
    'Ambient',
    'Blues',
    'Afro',
    'Funk & Disco',
    'Summer',
    'EQUAL',
  ]

  // Assuming the images are located in a folder named 'assets/images' in your project
  const categoryImages = categories.map(
    (category) =>
      `../../../public/spotify-pics/${category
        .toLowerCase()
        .replace(/ & /g, '-')
        .replace(/ /g, '-')}.png`
  )

  // Return an array of objects combining category names and their images
  return categories.map((category, index) => ({
    category,
    image: categoryImages[index],
  }))
}
