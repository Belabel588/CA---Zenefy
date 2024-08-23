import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import {
  ADD_STATION,
  SET_STATIONS,
  UPDATE_STATION,
  REMOVE_STATION,
} from '../store/reducers/station.reducer.js'

import { stationService } from '../services/stations.service.js'

import { LuClock3 } from 'react-icons/lu'

export function StationDetails() {
  const { stationId } = useParams()
  console.log(stationId)
  // const song = useSelector((storeState) => storeState.songModule.song)
  const [station, setStation] = useState({})

  useEffect(() => {
    // loadSong(songId)
    loadStation(stationId)
  }, [stationId])

  async function loadStation(stationId) {
    const stationToSet = await stationService.getStationById(stationId)
    console.log(stationToSet)
    setStation(stationToSet)
  }

  return (
    <section className='station-details-container'>
      <header className='station-header'>
        <img className='station-cover' src={station.imgUrl} />

        <div className='title-container'>
          <span>Playlist</span>
          <h3 className='station-title'>{station.title}</h3>
        </div>
      </header>

      <table className='liked-songs-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Album</th>
            <th>Date Added</th>
            <th>
              <LuClock3 />
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  )
}
