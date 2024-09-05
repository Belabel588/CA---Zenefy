import axios from 'axios'
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

export const apiService = {
  getVideos,
}

const API_URL = 'AIzaSyD6_dPEXi9GqT4WJ4FDa0Qme3uUzYOIwfU'

let url = 'https://www.googleapis.com/youtube/v3/channels'

// Youtube

async function getVideos(search) {
  const db = `${search}Youtube`
  const localRes = await storageService.query(db)

  if (localRes.length === 0) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet
      &videoEmbeddable=true&type=video&key=${API_URL}&q=${search}`

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

  const res = await storageService.query(db)
  const listRes = await storageService.query(listDB)
  videos = res[0].items

  const spotifyInfo = await getSpotify(search)

  if (listRes[0] && listRes[0].length > 0) {
    return listRes[0]
  }

  const regex = new RegExp(search, 'i')

  // const list = videos.map((video)=>{
  //   const currVideo = createVideo(videos[i])

  //   spotifyInfo.filter((track) => regex.test(track.name === currVideo.title))
  //   return {
  //     url: currVideo.url,
  //     name: spotifyInfo[i].name,
  //     artist: spotifyInfo[i].artist,
  //     album: spotifyInfo[i].album,
  //     cover: spotifyInfo[i].coverArt,
  //   }
  // })

  let counter
  if (spotifyInfo.length > videos.length) counter = videos.length
  if (
    spotifyInfo.length < videos.length ||
    spotifyInfo.length === videos.length
  )
    counter = spotifyInfo.length

  for (var i = 0; i < counter; i++) {
    const currVideo = createVideo(videos[i])

    spotifyInfo.filter((track) => regex.test(track.name === currVideo.title))

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
  }

  save(listDB, list)
  return list
}

// Spotify

function createVideo(video) {
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
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${artistName}/${trackName}`
  )
  const data = await response.json()
  return data.lyrics
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
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
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
