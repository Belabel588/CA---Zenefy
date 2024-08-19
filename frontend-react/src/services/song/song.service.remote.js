import { httpService } from '../http.service'

export const songService = {
  query,
  getById,
  save,
  remove,
  addCarMsg,
}

async function query(filterBy = { txt: '', price: 0 }) {
  return httpService.get(`song`, filterBy)
}

function getById(songId) {
  return httpService.get(`song/${songId}`)
}

async function remove(songId) {
  return httpService.delete(`song/${songId}`)
}
async function save(song) {
  var savedCar
  if (song._id) {
    savedCar = await httpService.put(`song/${song._id}`, song)
  } else {
    savedCar = await httpService.post('song', song)
  }
  return savedCar
}

async function addCarMsg(songId, txt) {
  const savedMsg = await httpService.post(`song/${songId}/msg`, { txt })
  return savedMsg
}
