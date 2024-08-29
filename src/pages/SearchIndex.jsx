import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'

import {
  SET_STATIONS,
  REMOVE_STATION,
  UPDATE_STATION,
  ADD_STATION,
  SET_FILTER_BY,
} from '../store/reducers/station.reducer.js'

import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'
import { apiService } from '../services/youtube-spotify.service.js'

import { SongList } from '../cmps/SongList.jsx'
import { SongFilter } from '../cmps/SongFilter.jsx'

import {
  loadStations,
  removeStation,
} from '../store/actions/station.actions.js'

export function SearchIndex() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())

  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  const dispatch = useDispatch()

  console.log('stations inside searchIndex : ', stations)

  useEffect(() => {
    dispatch({ type: SET_FILTER_BY, filterBy })
    loadStations()
  }, [])

  async function onRemoveSong(songId) {
    try {
      await removeStation(songId)
      showSuccessMsg('Song removed')
    } catch (err) {
      showErrorMsg('Cannot remove song')
    }
  }

  async function onAddSong() {
    const song = stationService.getEmptySong()
    song.name = prompt('Name?')
    try {
      const savedSong = await addSong(song)
      showSuccessMsg(`Song added (id: ${savedSong._id})`)
    } catch (err) {
      showErrorMsg('Cannot add song')
    }
  }

  async function onUpdateSong(song) {
    // const speed = +prompt('New speed?', song.speed)
    // if (speed === 0 || speed === song.speed) return

    // const songToSave = { ...song, speed }
    try {
      const savedSong = await updateSong(songToSave)
      showSuccessMsg(`Song updated`)
    } catch (err) {
      showErrorMsg('Cannot update song')
    }
  }

  async function getApiData() {
    const res = await apiService.getVideos('nirvana')
    console.log(res)
  }

  return (
    <main className='song-index'>
      <header>
        {userService.getLoggedinUser() && (
          <button onClick={onAddSong}>Add a Song</button>
        )}
      </header>
      <section>
        <ul className='search-list'>
          {stations
            .filter(
              (station, index, currentStations) =>
                currentStations.findIndex(
                  (currentStation) =>
                    currentStation.stationType === station.stationType
                ) === index
            )
            .map((uniqueStation) => (
              <Link to={`/genere/${uniqueStation._id}`} className='full-link'>
                <li key={uniqueStation._id}>{uniqueStation.stationType}</li>
              </Link>
            ))}
        </ul>
      </section>

      {/* <SongList
        songs={songs}
        onRemoveSong={onRemoveSong}
        onUpdateSong={onUpdateSong}
      /> */}
    </main>
  )
}
