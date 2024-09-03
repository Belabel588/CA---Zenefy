import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'
import { utilService } from '../services/util.service.js'

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
import { SuggestedStations } from '../cmps/SuggestedStations.jsx'

import { GoContainer } from 'react-icons/go'
import { FaCirclePlay } from 'react-icons/fa6'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

import playingAnimation from '../../public/img/playing.gif'
import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'

export function HomePage() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())

  const navigate = useNavigate()
  const dispatch = useDispatch()

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

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  )

  const pageRef = useRef()
  const gradientRefOne = useRef()
  const gradientRefTwo = useRef()
  const [currPageColor, setCurrColorPage] = useState(currColor)

  const [allStations, setAllStations] = useState([])

  useEffect(() => {
    dispatch({ type: SET_FILTER_BY, filterBy })
    getAllStations()
    
  }, [])

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      // getAllStations()
    }
  }, [windowDimensions])

  useEffect(() => {
    pageRef.current.style.backgroundColor = currColor
    setCurrColorPage(currColor)
  }, [currColor])

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem('', currStation)
  }

  async function getAllStations() {
    const { width } = windowDimensions
    const stations = await stationService.query({ stationType: 'music' })
    const filtered = stations.filter(
      (station) => !station.isLiked || station.isLiked === undefined
    )

    let numStationsToReturn
    const idxsToExclude = []

    if (width >= 1800) {
      numStationsToReturn = 7
    } else if (width >= 1200) {
      numStationsToReturn = 5
    } else if (width >= 600) {
      numStationsToReturn = 4
    } else if (width >= 300) {
      numStationsToReturn = 3
    } else {
      numStationsToReturn = 1
    }

    const stationsToReturn = filtered.reduce((accu, station, index) => {
      if (accu.length >= numStationsToReturn) return accu

      let randomIdx
      do {
        randomIdx = utilService.getRandomIntInclusive(0, filtered.length - 1)
      } while (idxsToExclude.includes(randomIdx))

      idxsToExclude.push(randomIdx)
      accu.push(filtered[randomIdx])

      return accu
    }, [])

    console.log(stationsToReturn)
    setAllStations(stationsToReturn)
  }

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    console.log(width)
    return {
      width,
      height,
    }
  }

  return (
    <section className='section home-container' ref={pageRef}>
      <div className='gradient-container' ref={gradientRefOne}></div>
      <Sort />
      <StationList gradientRefOne={gradientRefOne} />
      {user && <h2 className='made-for'>Made for {user.fullname}</h2>}
      {user && <SuggestedStations stations={allStations} />}
      {user && <h2 className='made-for'>Jump back in</h2>}
      {user && <SuggestedStations stations={stations} />}
    </section>
  );
}
      