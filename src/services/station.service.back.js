import { httpService } from './http.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'

import { loadStations } from '../store/actions/station.actions.js'
import { updateUser } from '../store/actions/user.actions.js'

const STORAGE_KEY = 'station'

export const stationService = {
  query,
  getById,
  save,
  remove,
  getEmptyStation,
  getDefaultFilter,
  addStationMsg,
  getItem,
  getItemsStation,
  getStationData,
  createStationFromSearch,
  likeSong,
  getCategoriesWithImages,
  getDefaultCurrItem,
  getDefaultCurrStation,
  getRandomArtist,
  createStationFromGemini,
}

async function query(filterBy = { txt: '' }) {
  return await httpService.get(STORAGE_KEY, filterBy)
}

async function getById(stationId) {
  return await httpService.get(`${STORAGE_KEY}/${stationId}`)
}

async function remove(stationId) {
  try {
    const res = await httpService.delete(`${STORAGE_KEY}/${stationId}`)
    const loggedinUser = userService.getLoggedinUser()
    const idxToRemove = loggedinUser.likedStationsIds.findIndex(
      (id) => id === stationId
    )

    loggedinUser.likedStationsIds.splice(idxToRemove, 1)
    const likedStationsIds = loggedinUser.likedStationsIds

    const userToUpdate = { ...loggedinUser, likedStationsIds }
    userService.saveLoggedinUser(userToUpdate)
    return res
  } catch (err) {
    console.log(err)
  }
}

async function save(station) {
  var savedStation
  if (station._id) {
    savedStation = await httpService.put(
      `${STORAGE_KEY}/${station._id}`,
      station
    )
  } else {
    delete station._id

    if (!station.isSearched) {
      const loggedinUser = userService.getLoggedinUser()
      station.title = `My Playlist #${loggedinUser.likedStationsIds.length + 1}`
      station.stationType = 'music'

      savedStation = await httpService.post(STORAGE_KEY, station)

      const userLikedStations = loggedinUser.likedStationsIds

      userLikedStations.push(savedStation._id)

      const updatedUser = {
        ...loggedinUser,
        likedStationsIds: userLikedStations,
      }
      await updateUser(updatedUser)
    } else {
      savedStation = await httpService.post(STORAGE_KEY, station)
    }
  }

  return savedStation
}
function getEmptyStation() {
  return {
    _id: '',
    title: '',
    items: [{ artist: '', id: '', name: '', url: '', cover: '' }],
    cover:
      'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2',
    addedAt: Date.now(),
  }
}

function getDefaultFilter() {
  return { txt: '', stationType: 'all' }
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
    title: utilService.capitalizeFirstLetters(keyWord) || 'Untitled Station', // Use the artist's name as the station title, fallback to 'Untitled Station'
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

function getDefaultCurrItem() {
  return {
    artist: 'Led Zeppelin',
    id: 'HJuxQX',
    name: 'Stairway to Heaven',
    album: 'Led Zeppelin IV',
    url: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
    cover: 'https://i1.sndcdn.com/artworks-000123427250-vyogac-t500x500.jpg',
    addedBy: 'user8',
    likedBy: [],
    addedAt: 1724685172590,
    duration: '08:02',
  }
}

function getDefaultCurrStation() {
  return {
    _id: 'eea466d1b245718f75a18403',
    stationType: 'music',
    title: 'Rock Classics',
    items: [
      {
        artist: 'Queen',
        id: 'zoaP5d',
        name: 'Bohemian Rhapsody',
        album: 'A Night at the Opera',
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        cover:
          'https://i1.sndcdn.com/artworks-000116795481-6fmihq-t500x500.jpg',
        addedBy: 'user7',
        likedBy: [],
        addedAt: 1724685172590,
        duration: '05:59',
      },
      {
        artist: 'Led Zeppelin',
        id: 'HJuxQX',
        name: 'Stairway to Heaven',
        album: 'Led Zeppelin IV',
        url: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
        cover:
          'https://i1.sndcdn.com/artworks-000123427250-vyogac-t500x500.jpg',
        addedBy: 'user8',
        likedBy: [],
        addedAt: 1724685172590,
        duration: '08:02',
      },
      {
        artist: 'The Beatles',
        id: 'aew9tr',
        name: 'Hey Jude',
        album: 'The Beatles Again',
        url: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
        cover:
          'https://upload.wikimedia.org/wikipedia/en/0/0a/Heyjudealbum.jpg',
        addedBy: 'user9',
        likedBy: [],
        addedAt: 1724685172590,
        duration: '08:09',
      },
    ],
    cover: 'https://i.scdn.co/image/ab67616d0000b273447f8b3ad12080b3fbe51f91',
    tags: ['rock', 'classics', 'legendary'],
    createdBy: {
      _id: 'creator3',
      fullname: 'Charlie Davis',
      imgUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    likedByUsers: [],
    addedAt: 1724685172590,
  }
}

function getRandomArtist() {
  const artists = [
    'Adele',
    'Beyoncé',
    'Drake',
    'Taylor Swift',
    'Ed Sheeran',
    'The Weeknd',
    'Kendrick Lamar',
    'Billie Eilish',
    'Rihanna',
    'Post Malone',
    'Led Zeppelin',
    'Pink Floyd',
    'The Rolling Stones',
    'Nirvana',
    'Queen',
    'The Beatles',
    'Radiohead',
    'U2',
    'Red Hot Chili Peppers',
    'David Bowie',
    'אריק איינשטיין', // Arik Einstein
    'שלמה ארצי', // Shlomo Artzi
    'עידן רייכל', // Idan Raichel
    'ריטה', // Rita
    'היהודים', // HaYehudim (The Jews)
    'משינה', // Mashina
    'שלום חנוך', // Shalom Hanoch
    'כוורת', // Kaveret
    'אביתר בנאי', // Evyatar Banai
    'עברי לידר', // Ivri Lider
  ]

  const randomIndex = Math.floor(Math.random() * artists.length)
  return artists[randomIndex]
}

async function createStationFromGemini(searchResults, keyWord) {
  // Create a new station object
  const user = userService.getLoggedinUser()
  // if()

  const station = {
    keyWord,
    // isSearched: true,
    stationType: searchResults.stationType || 'music', // Assuming the station type is always 'music'
    title: `Gemini Playlist`, // Use the artist's name as the station title, fallback to 'Untitled Station'
    preview: `This playlist was created with the power of AI. Prompt - ${keyWord}`,
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
