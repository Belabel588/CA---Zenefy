import { useState, useEffect, useRef } from 'react'
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

import { setIsPlaying } from '../store/actions/station.actions.js'

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
  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const isHover = useRef(false)

  function onSelectStation(stationId, ev) {
    setCurrentlyPlayedStation(stationId)
  }

  return (
    <section className='section home-container'>
      <Sort />
      <div className='stations-container'>
        {stations.map((station) => {
          return (
            <div
              to={`/station/${station.stationId}`}
              className='station-container'
              key={station.stationId}
              onClick={() => {
                if (isHover.current) return
                navigate(`/station/${station.stationId}`)
              }}
            >
              <img className='station-cover' src={station.imgUrl} alt='' />
              <span>{station.title}</span>

              {isPlaying && currStation.stationId === station.stationId ? (
                <div className='playing-container'>
                  <BiPause
                    className='pause-button'
                    onMouseEnter={() => {
                      isHover.current = true
                    }}
                    onMouseLeave={() => {
                      isHover.current = false
                    }}
                    onClick={() => setIsPlaying(false)}
                  />

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
                    onSelectStation(station.stationId, event)

                    setIsPlaying(true)
                  }}
                >
                  <BiPlay
                    className='play-button'
                    onMouseEnter={() => {
                      isHover.current = true
                    }}
                    onMouseLeave={() => {
                      isHover.current = false
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
