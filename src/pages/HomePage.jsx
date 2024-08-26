import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'

import { SongList } from '../cmps/SongList.jsx'
import { SongFilter } from '../cmps/SongFilter.jsx'
import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
} from '../store/actions/station.actions.js'

import { Sort } from '../cmps/Sort.jsx'

import { GoContainer } from 'react-icons/go'
import { FaCirclePlay } from 'react-icons/fa6'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

import playingAnimation from '../../public/img/playing.gif'

export function HomePage() {
  const navigate = useNavigate()

  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const isHover = useRef(false)

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem('', currStation)
  }

  return (
    <section className='section home-container'>
      <Sort />
      <div className='stations-container'>
        {stations.map((station) => {
          return (
            <div
              to={`/station/${station._id}`}
              className='station-container'
              key={station._id}
              onClick={() => {
                if (isHover.current) return
                navigate(`/station/${station._id}`)
              }}
            >
              <img className='station-cover' src={station.cover} alt='' />
              <span>{station.title}</span>

              {isPlaying && currStation._id === station._id ? (
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
                    onSelectStation(station._id)

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
