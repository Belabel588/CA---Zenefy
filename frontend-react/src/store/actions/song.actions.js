import { songService } from '../../services/song'
import { store } from '../store'
import {
  ADD_SONG,
  REMOVE_SONG,
  SET_SONGS,
  SET_SONG,
  UPDATE_SONG,
  ADD_SONG_MSG,
} from '../reducers/song.reducer'

export async function loadSongs(filterBy) {
  try {
    const songs = await songService.query(filterBy)
    store.dispatch(getCmdSetCars(songs))
  } catch (err) {
    console.log('Cannot load songs', err)
    throw err
  }
}

export async function loadSong(songId) {
  try {
    const song = await songService.getById(songId)
    store.dispatch(getCmdSetSong(song))
  } catch (err) {
    console.log('Cannot load song', err)
    throw err
  }
}

export async function removeSong(songId) {
  try {
    await songService.remove(songId)
    store.dispatch(getCmdRemoveSong(songId))
  } catch (err) {
    console.log('Cannot remove song', err)
    throw err
  }
}

export async function addSong(song) {
  try {
    const savedSong = await songService.save(song)
    store.dispatch(getCmdAddSong(savedSong))
    return savedSong
  } catch (err) {
    console.log('Cannot add song', err)
    throw err
  }
}

export async function updateSong(song) {
  try {
    const savedSong = await songService.save(song)
    store.dispatch(getCmdUpdateSong(savedSong))
    return savedSong
  } catch (err) {
    console.log('Cannot save song', err)
    throw err
  }
}

export async function addSongMsg(songId, txt) {
  try {
    const msg = await songService.addSongMsg(songId, txt)
    store.dispatch(getCmdAddCarMsg(msg))
    return msg
  } catch (err) {
    console.log('Cannot add song msg', err)
    throw err
  }
}

// Command Creators:
function getCmdSetSongs(songs) {
  return {
    type: SET_SONGS,
    songs,
  }
}
function getCmdSetSongs(song) {
  return {
    type: SET_SONG,
    song,
  }
}
function getCmdRemoveSong(songId) {
  return {
    type: REMOVE_SONG,
    songId,
  }
}
function getCmdAddSong(song) {
  return {
    type: ADD_SONG,
    song,
  }
}
function getCmdUpdateSong(song) {
  return {
    type: UPDATE_SONG,
    song,
  }
}
function getCmdAddSongMsg(msg) {
  return {
    type: ADD_SONG_MSG,
    msg,
  }
}

// unitTestActions()
async function unitTestActions() {
  await loadSongs()
  await addSong(songService.getEmptySong())
  await updateSong({
    _id: 'm1oC7',
    title: 'Song-Good',
  })
  await removeSong('m1oC7')
  // TODO unit test addCarMsg
}
