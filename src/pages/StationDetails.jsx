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
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

export function StationDetails() {
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currentlyPlayedStation
  )
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
          <b className='station-title'>{station.title}</b>
          <p className='playlist-summery'>Playlist summery here</p>
          <span className='playlist-artist'>Playlist artist here</span>
        </div>
      </header>
      <div className='buttons-container'>
        <div className='play-container'>
          <div className='play-button-container'>
            {currStation.stationId === station.stationId ? (
              <BiPause className='pause-button' />
            ) : (
              <BiPlay className='play-button' />
            )}
          </div>
          <RxPlusCircled className='option-button plus-button' />
          <BsThreeDots className='option-button more-button' />
        </div>
        <div className='list-container'>
          <span>List</span>
          <IoListSharp />
        </div>
      </div>
      <div className='items-container'>
        <div className='info-container'>
          <div className='title-container'>
            <span>#</span>
            <span>Title</span>
          </div>
          <span>Album</span>
          <span className='date-added span'>Date Added</span>
          <LuClock3 />
        </div>
      </div>
    </section>
  )
}
