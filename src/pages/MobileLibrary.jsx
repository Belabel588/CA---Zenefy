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
import { Footer } from '../cmps/Footer.jsx'

import { GoContainer } from 'react-icons/go'
import { FaCirclePlay } from 'react-icons/fa6'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

import playingAnimation from '../../public/img/playing.gif'
import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'


export function MobileLibrary() {
  const pageRef = useRef()
  const gradientRefOne = useRef()

  const [filtered, setFiltered] = useState([])
  const [allStations, setAllStations] = useState([])
  const [stations, setStations] = useState([])

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  return (
    <section className='section home-container' ref={pageRef}>
      <div className='gradient-container' ref={gradientRefOne}></div>
      <Sort setFiltered={setFiltered} />
      <StationList gradientRefOne={gradientRefOne} filtered={filtered} />
      {/* {<h2 className='made-for'>Made for {user && user.fullname}</h2>} */}
      <SuggestedStations stations={allStations} color={'#4a0e8b00'} />
      {/* {user && <h2 className='made-for'>Jump back in</h2>} */}
      <SuggestedStations stations={stations} />
      <Footer />
    </section>
  )
}