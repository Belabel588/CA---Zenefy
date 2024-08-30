import axios from 'axios'
import { storageService } from './async-storage.service.js'

export const apiService = {
  getVideos,
}

const API_URL = 'AIzaSyD6_dPEXi9GqT4WJ4FDa0Qme3uUzYOIwfU'

let url = 'https://www.googleapis.com/youtube/v3/channels'

let search = 'naruto'

// Youtube

async function getVideos(search) {
  const db = `${search}Youtube`
  console.log(db)
  const localRes = await storageService.query(db)

  if (localRes.length === 0) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet
      &videoEmbeddable=true&type=video&key=${API_URL}&q=${search}`

    const res = await axios.get(url)
    await storageService.post(`${db}`, res.data)
  }

  return createList(search)
}

async function createList(search) {
  const db = `${search}Youtube`
  let videos
  const list = []

  const res = await storageService.query(db)
  videos = res[0].items

  const spotifyInfo = await getSpotify(search)

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
  for (var i = 0; i < videos.length; i++) {
    const currVideo = createVideo(videos[i])

    spotifyInfo.filter((track) => regex.test(track.name === currVideo.title))

    list[i] = {
      url: currVideo.url,
      name: spotifyInfo[i].name,
      artist: spotifyInfo[i].artist,
      album: spotifyInfo[i].album,
      cover: spotifyInfo[i].coverArt,
    }
  }

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
  // const albumId = '1aYkTzRzHNSs0c1d9Cbo4Y' // Replace with actual album ID
  // const artistId = '1dfeR4HaWDbWqFHLkxMwi7' // Replace with actual artist ID
  // const search = 'Imagine' // Replace with actual search query

  // const album = await getAlbum(albumId, token);
  // console.log('Album:', album);

  // const artist = await getArtist(artistId, token);
  // console.log('Artist:', artist);
  const res = await query(db)

  if (res && res.length > 0) {
    return res
  }

  var tracks = await searchTracks(search, token)
  const regex = new RegExp(search, 'i')

  tracks.filter(
    (track) =>
      regex.test(track.name) ||
      regex.test(track.artist) ||
      regex.test(track.album)
  )
  const tracksToSave = tracks.map((track) => ({
    name: track.name,
    artist: track.artists.map((artist) => artist.name).join(', '),
    album: track.album.name,
    coverArt: track.album.images[0]?.url,
  }))

  save(db, tracksToSave)
  return tracksToSave
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
