import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'

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

import { setCurrentlyPlayedStation } from '../store/actions/station.actions.js'

import { GoContainer } from 'react-icons/go'

import { FaCirclePlay } from 'react-icons/fa6'
import playingAnimation from '../../public/img/playing.gif'

// to do: prevent default Link

export function HomePage() {
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  console.log(stations)
  const navigate = useNavigate()

  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currentlyPlayedStation
  )

  let isPlay

  function onSelectStation(stationId, ev) {
    ev.stopPropagation() // Stop the click from bubbling up to the Link
    ev.preventDefault()
    setCurrentlyPlayedStation(stationId)
  }

  return (
    <section className='section home-container'>
      <div className='filter-container'>
        <button>bla</button>
        <button>bla</button>
        <button>bla</button>
      </div>
      <div className='stations-container'>
        {stations.map((station) => {
          return (
            <div
              className='station-container'
              key={station.stationId}
              onClick={() => {
                // if (!isPlay) return
                // navigate(`/song`)
              }}
            >
              <img className='station-cover' src={station.imgUrl} alt='' />
              <span>{station.title}</span>

              <div
                className='play-button-container'
                onClick={() => {
                  isPlay = true
                  onSelectStation(station.stationId, event)
                  isPlay = false
                }}
              >
                <FaCirclePlay className='play-button' />
              </div>
              {currStation.stationId === station.stationId && (
                <img
                  className='playing-animation'
                  style={{ width: '35px' }}
                  src={playingAnimation}
                  alt=''
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
