import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'

import { StationList } from '../cmps/StationList.jsx'
import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
} from '../store/actions/station.actions.js'
import { apiService } from '../services/youtube-spotify.service.js'

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
  const currColor = useSelector(
    (stateSelector) => stateSelector.stationModule.currColor
  )

  const isHover = useRef(false)

  const pageRef = useRef()
  const gradientRefOne = useRef()
  const gradientRefTwo = useRef()
  const [currPageColor, setCurrColorPage] = useState(currColor)

  useEffect(() => {
    // loadStations()
  }, [stations])

  // useEffect(() => {
  //   if (currColor === '#706da4') return
  //   gradientRefOne.current.style.opacity = '0'
  //   gradientRefOne.current.style.background = `linear-gradient(0deg, #191414 60%, ${currColor} 90%, ${currColor} 100%)`
  //   gradientRefTwo.current.style.opacity = '0'
  //   gradientRefOne.current.style.opacity = '1'
  // }, [currColor])

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem('', currStation)
  }

  return (
    <section className='section home-container' ref={pageRef}>
      <div className='gradient-container-1' ref={gradientRefOne}></div>
      <div className='gradient-container-2' ref={gradientRefTwo}></div>
      <Sort />
      <StationList
        gradientRefOne={gradientRefOne}
        gradientRefTwo={gradientRefTwo}
      />
    </section>
  )
}
