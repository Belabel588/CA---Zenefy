import axios from 'axios'
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { geminiApiService } from './gemini-ai.api.service.js'
import { stationService } from './station.service.js'
import { saveStation } from '../store/actions/station.actions.js'
import { video } from '@cloudinary/url-gen/qualifiers/source'

export const apiService = {
  getVideos,
  getArtistByName,
  searchStations,
  geminiGenerate,
  getPlaylistsByCategory,
}

const API_URL = 'AIzaSyD6_dPEXi9GqT4WJ4FDa0Qme3uUzYOIwfU'

let url = 'https://www.googleapis.com/youtube/v3/channels'

let search = 'naruto'

// Youtube
async function getVideos(search) {
  const db = `${search}Youtube`
  const localRes = await storageService.query(db)

  if (!localRes || localRes.length === 0) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=${API_URL}&q=${search}&limit=1`
    const res = await axios.get(url)
    await storageService.post(db, res.data)
  }

  const videosWithDurations = await addVideoDurations(search)
  return createList(search, videosWithDurations)
}

// async function getPlaylistsByCategory(categoryName) {
//   const accessToken = await getAccessToken();
//   const listDB = `${categoryName}List`

//   // Fetch categories to get the ID for the category name
//   const categoryRes = await fetch(`https://api.spotify.com/v1/browse/categories`, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });

//   const categoryData = await categoryRes.json();

//   console.log('categoryData', categoryData);

//   const category = categoryData.categories.items.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

//   if (!category) {
//     throw new Error('Category not found');
//   }

//   const categoryId = category.id;
//   console.log(categoryId);

//   // Fetch playlists based on category ID
//   const playlistsRes = await fetch(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists`, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });

//   const playlistsData = await playlistsRes.json();
//   console.log(playlistsData);

//   // console.log(playlistsData.playlists.items[0]?.href);
//   // return playlistsData.playlists.items;

//   const url = playlistsData.playlists.items[0].tracks.href

//   // const url = data.playlists.items[0].tracks.href

//   const items = await searchItems(url)

//   console.log('ITEMS ARE', items);

//   let counter = 5

//   const list = []

//   for (var i = 0; i < counter; i++) {
//     const videos = await getVideos(items[i].track.name)

//     list[i] = videos[0]
//   }

//   console.log('LIST IS', list);

//   save(listDB, list)

//   return list
// }

async function getPlaylistsByCategory(categoryName) {
  const accessToken = await getAccessToken()
  const listDB = `${categoryName}List`

  // Fetch categories to get the ID for the category name
  const categoryRes = await fetch(
    `https://api.spotify.com/v1/browse/categories`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const categoryData = await categoryRes.json()
  console.log('categoryData', categoryData)

  const category = categoryData.categories.items.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  )

  if (!category) {
    throw new Error('Category not found')
  }

  const categoryId = category.id
  console.log(categoryId)

  // Fetch playlists based on category ID and limit to 5 items
  const playlistsRes = await fetch(
    `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=5`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const playlistsData = await playlistsRes.json()
  console.log(playlistsData)

  // Get the first 3 playlists
  const playlists = playlistsData.playlists.items.slice(0, 3)

  // Create a list to hold the 3 stations
  const stationList = []

  // Loop through each playlist and gather 5 songs for each station
  for (const playlist of playlists) {
    const url = playlist.tracks.href
    const items = await searchItems(url) // Fetch the tracks in the playlist
    console.log(items)

    const songList = await getVideos(items[0].track.name)
    console.log(songList)

    // Use the createStationFromSearch function to create a station
    const station = await stationService.createStationFromSearch(
      songList,
      categoryName
    )

    // Save each individual station
    const savedStation = await stationService.save(station)

    // Add the station to the list to return later
    stationList.push(savedStation)
  }

  console.log('Final Station List:', stationList)

  // Return the entire list of stations
  return stationList
}

async function createList(search, videosWithDuration) {
  const listDB = `${search}List`
  const listRes = await storageService.query(listDB)

  if (listRes && listRes.length > 0) {
    return listRes[0]
  }

  const db = `${search}Youtube`
  const res = await storageService.query(db)
  const videos = res[0]?.items || []
  const spotifyInfo = await getSpotify(search)
  const regex = new RegExp(search, 'i')

  const counter = Math.min(spotifyInfo.length, videos.length)

  const list = videos.slice(0, counter).map((video, i) => {
    const currVideo = createVideo(video)
    const track = spotifyInfo.find((track) => regex.test(track.name))

    return {
      url: currVideo.url,
      name: track?.name || 'Title not available',
      artist: track?.artist || 'Artist not available',
      album: track?.album || 'Album not available',
      cover:
        track?.cover ||
        'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2',
      id: utilService.makeId(),
      lyrics: track?.lyrics || 'Lyrics not available',
      duration: videosWithDuration[i]?.duration || '00:00',
    }
  })

  await storageService.post(listDB, list)
  return list
}

function createVideo(video) {
  return {
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
    title: video.snippet.title,
  }
}

async function addVideoDurations(search) {
  const db = `${search}Youtube`
  const localRes = await storageService.query(db)
  const videoIds = localRes[0].items.map((video) => video.id.videoId).join(',')

  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_URL}`
  const res = await axios.get(url)
  const videoDetails = res.data.items

  return localRes[0].items.map((video, index) => {
    const duration = convertDuration(
      videoDetails[index].contentDetails.duration
    )
    return { ...video, duration }
  })
}

function convertDuration(isoDuration) {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  const hours = (match[1] || '0H').slice(0, -1)
  const minutes = (match[2] || '0M').slice(0, -1)
  const seconds = (match[3] || '0S').slice(0, -1)

  return `${hours > 0 ? hours + ':' : ''}${minutes.padStart(
    2,
    '0'
  )}:${seconds.padStart(2, '0')}`
}

// Spotify
async function getSpotify(search) {
  const token = await getAccessToken()
  const db = `${search}Spotify`
  const res = await query(db)

  if (res && res.length > 0) {
    return res
  }

  let tracks = await searchTracks(search, token)
  const regex = new RegExp(search, 'i')

  tracks = tracks.filter(
    (track) =>
      regex.test(track.name) ||
      regex.test(track.artists.map((artist) => artist.name).join(', ')) ||
      regex.test(track.album.name)
  )

  const tracksToSave = await Promise.all(
    tracks.map(async (track) => {
      const title = track.name
      const artist =
        track.artists.map((artist) => artist.name).join(', ') ||
        track.artists[0]
      let lyrics

      if (title && artist) {
        try {
          lyrics = await getLyrics(title, artist)
        } catch (err) {
          console.log(err)
        }
      }

      return {
        name: track.name,
        artist,
        album: track.album.name,
        cover: track.album.images[0]?.url,
        lyrics: lyrics || 'Lyrics not found',
      }
    })
  )

  await save(db, tracksToSave)
  return tracksToSave
}

async function getLyrics(trackName, artistName) {
  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${artistName}/${trackName}`
    )
    const data = await response.json()
    return data.lyrics || 'Lyrics not available'
  } catch (err) {
    console.log(err)
  }
}

async function query(search) {
  return (await storageService.query(search))[0]
}

async function save(searchTerm, searchTracks) {
  return await storageService.post(searchTerm, searchTracks)
}

async function getAccessToken() {
  const CLIENT_ID = '20b099b348044bd393f994cc43d406af'
  const CLIENT_SECRET = 'ea1050b8ad0a4a2eb49a5c4d4861a4c4'
  const encodedCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + encodedCredentials,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
    })

    const data = await response.json()
    return data.access_token
  } catch (err) {
    console.error('Error fetching token:', err.message)
  }
}

async function searchTracks(query, token) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=5&q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return data.tracks.items
  } catch (error) {
    console.error('Error searching for tracks:', error)
  }
}

async function getArtistByName(artistName) {
  const accessToken = await getAccessToken()
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artistName
    )}&type=artist&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await response.json()
  return data.artists.items
}

async function searchStations(search) {
  const listDB = `${search}List`
  const listRes = await storageService.query(listDB)

  if (listRes[0] && listRes[0].length > 0) {
    return listRes[0]
  }

  const accessToken = await getAccessToken()
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      search
    )}&type=playlist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await response.json()
  const url = data.playlists.items[0].tracks.href
  const items = await searchItems(url)

  const list = await Promise.all(
    items.slice(0, 5).map(async (item) => {
      const videos = await getVideos(item.track.name)
      return videos[0]
    })
  )

  await save(listDB, list)
  return list
}

async function searchItems(url) {
  const accessToken = await getAccessToken() // Replace with your Spotify API access token
  console.log('url INSIDE SEARCH ITEMS', url)

  // Check if the URL already has query parameters
  if (url.includes('?')) {
    // If it already has query parameters, append using '&'
    url = url + '&limit=5'
  } else {
    // If it doesn't have query parameters, append using '?'
    url = url + '?limit=5'
  }
  const response = await fetch(`${url}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await response.json()

  return data.items
}

async function geminiGenerate(searchTerm) {
  const list = await searchStations(searchTerm)
  const newStation = await geminiApiService.gptCall(list, searchTerm)
  await stationService.saveStation(newStation)

  saveStation(newStation)
  return newStation
}
