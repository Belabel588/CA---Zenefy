import { httpService } from '../http.service'

export const stationService = {
  query,
  getById,
  save,
  remove,
  addCarMsg,
}

async function query(filterBy = { txt: '' }) {
  return httpService.get(`station`, filterBy)
}

function getById(stationId) {
  return httpService.get(`station/${stationId}`)
}

async function remove(stationId) {
  return httpService.delete(`station/${stationId}`)
}
async function save(station) {
  var savedStation
  if (station._id) {
    savedStation = await httpService.put(`station/${station._id}`, station)
  } else {
    savedStation = await httpService.post('station', station)
  }
  return savedStation
}
