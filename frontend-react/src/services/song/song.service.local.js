import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'
import { userService } from '../user'

const STORAGE_KEY = 'song'

export const songService = {
  query,
  getById,
  save,
  remove,
  addCarMsg,
}
window.cs = songService

async function query(filterBy = { txt: '', price: 0 }) {
  var songs = await storageService.query(STORAGE_KEY)
  const { txt, minSpeed, maxPrice, sortField, sortDir } = filterBy

  if (txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    songs = songs.filter(
      (song) => regex.test(song.vendor) || regex.test(song.description)
    )
  }
  if (minSpeed) {
    songs = songs.filter((song) => song.speed >= minSpeed)
  }
  if (sortField === 'vendor' || sortField === 'owner') {
    songs.sort(
      (song1, song2) =>
        song1[sortField].localeCompare(song2[sortField]) * +sortDir
    )
  }
  if (sortField === 'price' || sortField === 'speed') {
    songs.sort(
      (song1, song2) => (song1[sortField] - song2[sortField]) * +sortDir
    )
  }

  songs = songs.map(({ _id, vendor, price, speed, owner }) => ({
    _id,
    vendor,
    price,
    speed,
    owner,
  }))
  return songs
}

function getById(songId) {
  return storageService.get(STORAGE_KEY, songId)
}

async function remove(songId) {
  // throw new Error('Nope')
  await storageService.remove(STORAGE_KEY, songId)
}

async function save(song) {
  var savedCar
  if (song._id) {
    const songToSave = {
      _id: song._id,
      price: song.price,
      speed: song.speed,
    }
    savedCar = await storageService.put(STORAGE_KEY, songToSave)
  } else {
    const songToSave = {
      vendor: song.vendor,
      price: song.price,
      speed: song.speed,
      // Later, owner is set by the backend
      owner: userService.getLoggedinUser(),
      msgs: [],
    }
    savedCar = await storageService.post(STORAGE_KEY, songToSave)
  }
  return savedCar
}

async function addCarMsg(songId, txt) {
  // Later, this is all done by the backend
  const song = await getById(songId)

  const msg = {
    id: makeId(),
    by: userService.getLoggedinUser(),
    txt,
  }
  song.msgs.push(msg)
  await storageService.put(STORAGE_KEY, song)

  return msg
}
