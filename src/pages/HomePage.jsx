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

import { Sort } from '../cmps/Sort.jsx'
import { setCurrentlyPlayedStation } from '../store/actions/station.actions.js'

import { GoContainer } from 'react-icons/go'

import { FaCirclePlay } from 'react-icons/fa6'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

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
      <Sort />
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
              <Link to={`/station/${station.stationId}`}>
                <span>{station.title}</span>
              </Link>
              {/* <div
                className='play-button-container'
                onClick={() => {
                  isPlay = true
                  onSelectStation(station.stationId, event)
                  isPlay = false
                }}
              ></div> */}
              {currStation.stationId === station.stationId ? (
                <div className='playing-container'>
                  <BiPause className='pause-button' />

                  <img
                    className='playing-animation'
                    src={playingAnimation}
                    alt=''
                  />
                </div>
              ) : (
                <div
                  className='play-button-container'
                  onClick={() => {
                    isPlay = true
                    onSelectStation(station.stationId, event)
                    isPlay = false
                  }}
                >
                  <BiPlay className='play-button' />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
