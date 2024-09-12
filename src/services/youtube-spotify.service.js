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

// Youtube
async function getVideos(search) {
  const db = `${search}Youtube`
  const localRes = await storageService.query(db)

  if (!localRes || localRes.length === 0) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=${API_URL}&q=${search}&limit=4`
    const res = await axios.get(url)
    await storageService.post(db, res.data)
  }

  const videosWithDurations = await addVideoDurations(search)
  return createList(search, videosWithDurations)
}

async function createList(search, videosWithDuration) {
  const listDB = `${search}List`
  const listRes = await storageService.query(listDB)
  console.log(listRes)
  // Return cached result if it already exists
  if (listRes[0] && listRes[0].length > 0) {
    return listRes[0]
  }

  const db = `${search}Youtube`
  const res = await storageService.query(db)
  const videos = res[0]?.items || []
  const spotifyInfo = await getSpotify(search)
  const regex = new RegExp(search, 'i')
  console.log(spotifyInfo)

  const counter = Math.min(spotifyInfo.length, videos.length)
  let filteredTracks = spotifyInfo

  // Create a list of matched videos and tracks
  const list = videos.slice(0, counter).map((video, i) => {
    // Find a matching track using regex and remove it from filteredTracks
    const trackIndex = filteredTracks.findIndex(
      (track) =>
        regex.test(track.name) ||
        regex.test(track.artist) ||
        regex.test(track.album)
    )

    // If a matching track is found, remove it from the filteredTracks array
    const track =
      trackIndex !== -1 ? filteredTracks.splice(trackIndex, 1)[0] : null

    // Create the video object
    const currVideo = createVideo(video)

    // No filtering out of tracks; maintain the full list.

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
    tracks
      .filter(
        (track, index, self) =>
          // Keep only the first occurrence of each track name
          index === self.findIndex((t) => t.name === track.name)
      )
      .map(async (track) => {
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
    console.log(data.tracks.items)
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
  const accessToken = await getAccessToken()
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()
  return data.items
}

// Gemini AI
async function geminiGenerate(searchTerm) {
  const list = await searchStations(searchTerm)
  const newStation = await geminiApiService.gptCall(list, searchTerm)
  await stationService.saveStation(newStation)

  saveStation(newStation)
  return newStation
}
