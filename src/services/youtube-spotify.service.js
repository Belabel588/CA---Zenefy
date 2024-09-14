import axios from 'axios'
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { video } from '@cloudinary/url-gen/qualifiers/source'
import { stationService } from './station.service.js'

export const apiService = {
  getVideos,
  getArtistByName,
  searchStations,
  getPlaylistsByCategory,
}
const API_URL2 = 'AIzaSyD5ya6TB4gnb47HnJwVKZB1xyKY4E71j5o'
const API_URL = 'AIzaSyD5ya6TB4gnb47HnJwVKZB1xyKY4E71j5o'
// OLD API_URL = AIzaSyD6_dPEXi9GqT4WJ4FDa0Qme3uUzYOIwfU
let url = 'https://www.googleapis.com/youtube/v3/channels'

let search = 'naruto'

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




async function getPlaylistsByCategory(categoryName) {
  const accessToken = await getAccessToken();
  const listDB = `${categoryName}List`;

  // Fetch categories to get the ID for the category name
  const categoryRes = await fetch(`https://api.spotify.com/v1/browse/categories`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const categoryData = await categoryRes.json();
  console.log('categoryData', categoryData);


  const category = categoryData.categories.items.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    throw new Error('Category not found');
  }

  const categoryId = category.id;
  console.log(categoryId);

  // Fetch playlists based on category ID and limit to 5 items
  const playlistsRes = await fetch(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=5`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const playlistsData = await playlistsRes.json();
  console.log(playlistsData);

  // Get the first 3 playlists
  const playlists = playlistsData.playlists.items.slice(0, 3);

  // Create a list to hold the 3 stations
  const stationList = [];
  
  console.log('playlists ARE' , playlists);
  // Loop through each playlist and gather 5 songs for each station
  for (let i = 0; i < playlists.length; i++) {
    const playlist = playlists[i];
    const url = playlist.tracks.href;
    
    // Fetch the tracks in the playlist
    const items = await searchItems(url);
    console.log('Fetched Items:', items);
  
    // Get video list for the first track
    const songList = await getVideos(items[0].track.name);
    console.log('Song List:', songList);
  
    // Use the createStationFromSearch function to create a station
    const station = await stationService.createStationFromSearch(songList, categoryName);
    console.log('STATION IS', station);
  
    // Save each individual station
    const savedStation = await stationService.save(station);
    console.log('SAVED STATION IS', savedStation);
  
    // Add the station to the list to return later
    stationList.push(savedStation);
    console.log('Updated Station List:', stationList);
  }


  // Return the entire list of stations
  return stationList;
}

async function searchItems(url) {
  const accessToken = await getAccessToken(); // Replace with your Spotify API access token
  console.log('url INSIDE SEARCH ITEMS', url);

  // Check if the URL already has query parameters
  if (url.includes('?')) {
    // If it already has query parameters, append using '&'
    url = url + '&limit=5';
  } else {
    // If it doesn't have query parameters, append using '?'
    url = url + '?limit=5';
  }

  const response = await fetch(`${url}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log('data.items INSIDE SEARCH ITEMS', data.items);

  return data.items;
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
          // lyrics = await getLyrics(title, artist)
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

// async function getLyrics(trackName, artistName) {
//   const response = await fetch(
//     `https://api.lyrics.ovh/v1/${artistName}/${trackName}`
//   )
//   const data = await response.json()
//   return data.lyrics
// }

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

async function getArtistByName(artistName) {
  const accessToken = await getAccessToken() // Replace with your Spotify API access token
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artistName
    )}&type=artist`,
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
    )}&type=playlist`,
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



