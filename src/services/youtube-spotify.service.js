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
  getRandomFeaturedPlaylists,
}

const API_URL = import.meta.env.VITE_YOUTUBE_API

// Youtube
async function getVideos(search, limit = null) {
  try {
    const db = `${search}Youtube`
    const localRes = await storageService.query(db)

    if (!localRes || localRes.length === 0) {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=${API_URL}&q=${search}&limit=4`
      const res = await axios.get(url)
      await storageService.post(db, res.data)
    }
    let videosWithDurations
    if (limit) {
      videosWithDurations = await addVideoDurations(search, limit)
    } else {
      videosWithDurations = await addVideoDurations(search)
    }
    // console.log(videosWithDurations)
    let list
    if (limit) {
      list = await createList(search, videosWithDurations, limit)
    } else {
      list = await createList(search, videosWithDurations)
    }
    if (limit === 1) {
      return list[0]
    } else {
      return list
    }
  } catch (err) {
    console.log(err)
  }
}

async function getPlaylistsByCategory(categoryName) {
  const accessToken = await getAccessToken();
  const listDB = `${categoryName}List`;

  
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

  console.log('playlists ARE', playlists);
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

async function getRandomFeaturedPlaylists() {
  const accessToken = await getAccessToken();
  const listDB = 'RandomFeaturedPlaylists';

  // Fetch featured playlists with a limit of 20
  const featuredPlaylistsRes = await fetch('https://api.spotify.com/v1/browse/featured-playlists?limit=20', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const featuredPlaylistsData = await featuredPlaylistsRes.json();
  console.log('Featured Playlists Data:', featuredPlaylistsData);

  // Shuffle playlists and pick up to 3 random ones that have titles and covers
  const shuffledPlaylists = featuredPlaylistsData.playlists.items.sort(() => 0.5 - Math.random());
  const filteredPlaylists = shuffledPlaylists.filter(playlist => playlist.name && playlist.images && playlist.images.length > 0);
  
  const stationList = [];
  
  for (let i = 0; i < filteredPlaylists.length && stationList.length < 3; i++) {
    const playlist = filteredPlaylists[i];
    const url = playlist.tracks.href;

    // Fetch the tracks in the playlist
    const items = await searchItems(url);
    console.log('Fetched Items:', items);

    // Get video list for the first track
    const songList = await getVideos(items[0].track.name);
    console.log('Song List:', songList);

    // Use the createStationFromSearch function to create a station
    const station = await stationService.createStationFromSearch(songList, 'Featured');
    console.log('STATION IS', station);

    // Validate the station before saving
    if (station.title!== 'Untitled Station' && station.cover !== 'default_cover_url') {
      // Save each individual station
      const savedStation = await stationService.save(station);
      console.log('SAVED STATION IS', savedStation);

      // Add the station to the list to return later
      stationList.push(savedStation);
      console.log('Updated Station List:', stationList);
    } else {
      console.log('Skipping station due to missing title or cover:', station);
    }
  }

  // Return the entire list of stations
  return stationList;
}


async function createList(search, videosWithDuration, limit = null) {
  try {
    const listDB = `${search}List`
    const listRes = await storageService.query(listDB)

    // Return cached result if it already exists
    if (listRes[0] && listRes[0].length > 0) {
      return listRes[0]
    }

    const db = `${search}Youtube`
    const res = await storageService.query(db)
    const videos = res[0]?.items || []
    const spotifyInfo = await getSpotify(search)
    const regex = new RegExp(search, 'i')
    // console.log(spotifyInfo)

    let counter
    if (limit) {
      counter = limit
    } else {
      counter = Math.min(spotifyInfo.length, videos.length)
    }
    let filteredTracks = spotifyInfo
    // console.log(videosWithDuration)
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
      // console.log(track)
      // console.log(video)
      // No filtering out of tracks; maintain the full list.

      if (limit) {
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
          duration: videosWithDuration.duration || '00:00',
        }
      } else {
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
          duration: videosWithDuration[i].duration || '00:00',
        }
      }
    })

    await storageService.post(listDB, list)
    return list
  } catch (err) {
    console.log(err)
  }
}

function createVideo(video) {
  return {
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
    title: video.snippet.title,
  }
}

async function addVideoDurations(search, limit = null) {
  try {
    const db = `${search}Youtube`
    const localRes = await storageService.query(db)
    const videoIds = localRes[0].items
      .map((video) => video.id.videoId)
      .join(',')
    const video = localRes[0]

    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_URL}`
    const res = await axios.get(url)
    // console.log(res)
    const videoDetails = res.data.items
    if (!limit) {
      return localRes[0].items.map((video, index) => {
        const duration = convertDuration(
          videoDetails[index].contentDetails.duration
        )
        return { ...video, duration }
      })
    } else {
      for (let i = 0; i < limit; i++) {
        // console.log(videoDetails[i])
        const duration = convertDuration(
          videoDetails[i].contentDetails.duration
        )
        // console.log(duration)
        // console.log({ ...video, duration })
        return { ...video, duration }
      }
    }
  } catch (err) {
    console.log(err)
  }
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
  try {
    const token = await getAccessToken()
    const db = `${search}Spotify`
    const res = await query(db)

    if (res && res.length > 0) {
      return res
    }

    let tracks = await searchTracks(search, token)
    const regex = new RegExp(search, 'i')
    // console.log(tracks)
    tracks = tracks.filter((track) => {
      // Ensure fields exist before applying regex
      const name = track.name || ''
      const albumName = track.album?.name || ''
      const artists = track.artists?.map((artist) => artist.name) || []

      // Check if any field matches the regex
      return (
        regex.test(name) ||
        artists.some((artistName) => regex.test(artistName)) ||
        regex.test(albumName)
      )
    })

    // console.log(tracks)

    const tracksToSave = await Promise.all(
      tracks
        .filter(
          (track, index, self) =>
            // Keep only the first occurrence of each track name
            index === self.findIndex((t) => t.name === track.name)
        )
        .map((track) => {
          const title = track.name
          const artist = track.artists[0].name
          let lyrics

          // if (title && artist) {
          //   try {
          //     lyrics = await getLyrics(title, artist)
          //   } catch (err) {
          //     console.log(err)
          //   }
          // }
          // console.log(track)
          return {
            name: track.name,
            artist,
            album: track.album.name,
            cover: track.album.images[0]?.url,
            lyrics: 'Lyrics not found',
          }
        })
    )

    // await save(db, tracksToSave)
    save(db, tracksToSave)
    return tracksToSave
  } catch (err) {
    console.log(err)
  }
}

// async function getLyrics(trackName, artistName) {
//   const response = await fetch(
//     `https://api.lyrics.ovh/v1/${artistName}/${trackName}`
//   )
//   const data = await response.json()
//   return data.lyrics
// }

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
  // console.log(query)
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
    // console.log(data.tracks.items)
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
  if (!searchTerm) return
  try {
    // Get generated results from Gemini API
    const songs = await geminiApiService.generate(searchTerm)
    // console.log(songs)
    const videoPromises = songs.map((song) => getVideos(song, 1))
    // console.log(videoPromises)
    const resolved = await Promise.all(videoPromises)
    // console.log(resolved)
    const filteredResults = resolved.filter((video) => video.url)
    const station = await stationService.createStationFromGemini(
      filteredResults,
      searchTerm
    )
    const savedStation = await stationService.save(station)
    // console.log(savedStation)
    return savedStation
  } catch (err) {
    console.error('Error in geminiGenerate:', err)
  }
}
