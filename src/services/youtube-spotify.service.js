import axios from 'axios'
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { geminiApiService } from './gemini-ai.api.service.js'
import { stationService } from './station.service.js'
import { saveStation } from '../store/actions/station.actions.js'

export const apiService = {
  getVideos,
  getArtistByName,
  searchStations,
  geminiGenerate,
}

// const API_URL = 'AIzaSyD6_dPEXi9GqT4WJ4FDa0Qme3uUzYOIwfU'
const API_URL = 'AIzaSyCU634ZyyEilTDAXETrCwAJmpdmzuoMdv8'

let url = 'https://www.googleapis.com/youtube/v3/channels'

let search = 'naruto'

// Youtube

async function getVideos(search) {
  const db = `${search}Youtube`
  const localRes = await storageService.query(db)

  if (localRes.length === 0) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet
      &videoEmbeddable=true&type=video&key=${API_URL}&q=${search}&limit=1`

    const res = await axios.get(url)

    await storageService.post(`${db}`, res.data)
  }
  const videosWithDurations = await addVideoDurations(search)

  return createList(search, videosWithDurations)
}

async function createList(search, videosWithDuration) {
  const db = `${search}Youtube`
  let videos
  const list = []
  const listDB = `${search}List`

  const listRes = await storageService.query(listDB)
  if (listRes[0] && listRes[0].length > 0) {
    return listRes[0]
  }

  const res = await storageService.query(db)
  videos = res[0].items

  const spotifyInfo = await getSpotify(search)

  const regex = new RegExp(search, 'i')

  let counter
  if (spotifyInfo.length > videos.length) counter = videos.length
  if (
    spotifyInfo.length < videos.length ||
    spotifyInfo.length === videos.length
  )
    counter = spotifyInfo.length

  for (var i = 0; i < counter; i++) {
    const currVideo = createVideo(videos[i])
    console.log(currVideo)
    spotifyInfo.filter((track) => regex.test(track.name === currVideo.title))
    console.log(spotifyInfo)
    console.log(videosWithDuration)
    list[i] = {
      url: currVideo.url,
      name: spotifyInfo[i].name || 'Title not available',
      artist: spotifyInfo[i].artist || 'Artist not available',
      album: spotifyInfo[i].album || 'Album not available',
      cover:
        spotifyInfo[i].cover ||
        'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2',
      id: utilService.makeId(),
      lyrics: spotifyInfo[i].lyrics || 'Lyrics not available',
      duration: videosWithDuration[i].duration || '00:00',
    }
    console.log(list[i])
  }

  save(listDB, list)
  return list
}

// Spotify

function createVideo(video) {
  console.log(video)
  const youtubeVideo = {
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
    title: video.snippet.title,
  }

  return youtubeVideo
}

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
      } else {
        lyrics = 'Lyrics not found'
      }

      return {
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(', '),
        album: track.album.name,
        cover: track.album.images[0]?.url,
        lyrics: lyrics || 'Lyrics not found',
      }
    })
  )

  save(db, tracksToSave)
  return tracksToSave
}

async function addVideoDurations(search) {
  const db = `${search}Youtube`
  const localRes = await storageService.query(db)

  // Extract video IDs from the saved search results
  const videoIds = localRes[0].items.map((video) => video.id.videoId).join(',')

  // Fetch video details including duration
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_URL}`
  const res = await axios.get(url)
  const videoDetails = res.data.items

  // Combine video details with durations
  return localRes[0].items.map((video, index) => {
    const duration = convertDuration(
      videoDetails[index].contentDetails.duration
    )
    return {
      ...video,
      duration,
    }
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

async function getLyrics(trackName, artistName) {
  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${artistName}/${trackName}`
    )
    const data = await response.json()
    if (!data.lyrics) {
      return 'Lyrics not available'
    }
    return data.lyrics
  } catch (err) {
    console.log(err)
  }
}

async function query(search) {
  var tracks = await storageService.query(search)
  return tracks[0]
}

async function save(searchTerm, searchTracks) {
  const savedTracks = await storageService.post(searchTerm, searchTracks)

  return savedTracks
}

async function getAccessToken() {
  const CLIENT_ID = '20b099b348044bd393f994cc43d406af'
  const CLIENT_SECRET = 'ea1050b8ad0a4a2eb49a5c4d4861a4c4'

  // Encode credentials using btoa
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

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    const token = data.access_token
    // console.log('Access Token:', token)
    return token
  } catch (err) {
    console.error('Error fetching token:', err.message)
  }
}

async function getAlbum(albumId, token) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching album:', error)
  }
}

async function getArtist(artistId, token) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching artist:', error)
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

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data.tracks.items // Array of track objects
  } catch (error) {
    console.error('Error searching for tracks:', error)
  }
}

async function getArtistByName(artistName) {
  const accessToken = await getAccessToken() // Replace with your Spotify API access token
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
  return data.artists.items // Returns the array of artists
}

async function searchStations(search) {
  const listDB = `${search}List`

  const listRes = await storageService.query(listDB)

  if (listRes[0] && listRes[0].length > 0) {
    return listRes[0]
  }

  const accessToken = await getAccessToken() // Replace with your Spotify API access token
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

  let counter = 5

  const list = []

  for (var i = 0; i < counter; i++) {
    const videos = await getVideos(items[i].track.name)
    list[i] = videos[0]
  }
  save(listDB, list)

  return list
}

async function searchItems(url) {
  const accessToken = await getAccessToken() // Replace with your Spotify API access token
  const response = await fetch(`${url}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await response.json()

  return data.items
}

async function geminiGenerate(category = 'Workout') {
  try {
    const res = await geminiApiService.generate(category)
    console.log(res)

    const items = await Promise.all(
      res.map(async (song) => {
        const db = `${song}Youtube`
        let localRes = await storageService.query(db)

        // If no local result, fetch from YouTube API and store it
        if (!localRes || localRes.length === 0) {
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=${API_URL}&q=${song}`
          const youtubeRes = await axios.get(url)
          localRes = youtubeRes.data
          await storageService.post(db, localRes)
        }

        const videosWithDurations = await addVideoDurations(song)
        console.log(videosWithDurations)

        const items = await createList(song, videosWithDurations)
        const filtered = items.filter((item) => item) // Filter out falsy items

        const itemToReturn = filtered.find(
          (item) =>
            item.album &&
            item.artist &&
            item.cover &&
            item.duration &&
            item.id &&
            item.lyrics &&
            item.name &&
            item.url
        )

        console.log(itemToReturn)
        return itemToReturn || null // Return the item or null if nothing found
      })
    )

    console.log(items)

    // Filter valid items
    const filteredResults = items.filter((item) => item)
    console.log(filteredResults)

    // Create and save the station
    if (filteredResults.length > 0) {
      const station = await stationService.createStationFromGemini(
        filteredResults,
        category
      )
      const savedStation = await stationService.save(station)
      console.log(savedStation)
      return savedStation
    }
    // const res = await geminiApiService.generate(category)
    // console.log(res)
    // const videosList = []
    // let counter = 0
    // const items = res.map(async (song, index) => {
    //   // console.log(song)
    //   // const item = await getVideos(song)

    //   const db = `${song}Youtube`
    //   const localRes = await storageService.query(db)

    //   if (localRes.length === 0 && !localRes[0]) {
    //     const url = `https://www.googleapis.com/youtube/v3/search?part=snippet
    //     &videoEmbeddable=true&type=video&key=${API_URL}&q=${song}`

    //     const res = await axios.get(url)

    //     await storageService.post(`${db}`, res.data)
    //   }
    //   const videosWithDurations = await addVideoDurations(song)
    //   console.log(videosWithDurations)

    //   const items = await createList(song, videosWithDurations)

    //   const filtered = items.filter((item) => {
    //     if (item) return item
    //   })
    //   console.log(filtered)
    //   const itemToReturn = filtered.find(
    //     (item) =>
    //       item.album &&
    //       item.artist &&
    //       item.cover &&
    //       item.duration &&
    //       item.id &&
    //       item.lyrics &&
    //       item.name &&
    //       item.url
    //   )

    //   console.log(itemToReturn)
    //   if (itemToReturn) {
    //     return itemToReturn
    //   } else {
    //   }
    // })

    // // console.log(items)
    // // const itemsList = await createList('Workout', videosList)
    // const results = await Promise.all(items)
    // console.log(results)
    // const filteredResults = results.filter((item) => item)
    // const station = await stationService.createStationFromGemini(
    //   filteredResults,
    //   category
    // )
    // const savedStation = await stationService.save(station)
    // console.log(savedStation)
  } catch (err) {
    console.log(err)
  }
}
