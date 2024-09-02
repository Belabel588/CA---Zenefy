import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'

import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
} from '../store/actions/station.actions.js'

import { Sort } from '../cmps/Sort.jsx'
import { PlayingAnimation } from '../cmps/PlayingAnimation.jsx'

import { GoContainer } from 'react-icons/go'
import { FaCirclePlay } from 'react-icons/fa6'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

// import playingAnimation from '../../public/img/playing.gif'

export function StationList(gradientRefOne, gradientRefTwo) {
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
  const currColor = useSelector(
    (stateSelector) => stateSelector.stationModule.currColor
  )

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )
  const isHover = useRef(false)

  const [currPageColor, setCurrColorPage] = useState(currColor)

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }
  let counter = 0

  useEffect(() => {
    console.log(stations)
  }, [stations])

  return (
    <div className='stations-container'>
      {stations.map((station) => {
        if (counter >= 8) return
        counter++
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
                <div className='animation-container'>
                  <PlayingAnimation />
                </div>
              </div>
            ) : (
              <div
                className='play-button-container'
                onClick={() => {
                  if (station.items.length === 0) return
                  if (currStation._id === station._id) {
                    setIsPlaying(true)
                    return
                  }
                  onSelectStation(station._id)
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
  )
}
