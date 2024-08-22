import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  SET_STATIONS,
  REMOVE_STATION,
  UPDATE_STATION,
  ADD_STATION,
} from '../store/reducers/station.reducer.js'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/stations.service.js'
import { userService } from '../services/user.service.js'

import { SongList } from '../cmps/SongList.jsx'
import { SongFilter } from '../cmps/SongFilter.jsx'
import {
  loadStations,
  removeStation,
} from '../store/actions/station.actions.js'

export function SongIndex() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const songs = useSelector((storeState) => storeState.stationModule.stations)

  useEffect(() => {
    loadStations(filterBy)
  }, [filterBy])

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

  return (
    <main className='song-index'>
      <header>
        {userService.getLoggedinUser() && (
          <button onClick={onAddSong}>Add a Song</button>
        )}
      </header>
      <SongFilter filterBy={filterBy} setFilterBy={setFilterBy} />
      <SongList
        songs={songs}
        onRemoveSong={onRemoveSong}
        onUpdateSong={onUpdateSong}
      />
    </main>
  )
}
