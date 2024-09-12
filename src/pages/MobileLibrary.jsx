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

import { FaPlus } from 'react-icons/fa6'
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5'

import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
} from '../store/actions/station.actions.js'

import { saveStation } from '../store/actions/station.actions.js'

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
  const inputRef = useRef()

  const [filtered, setFiltered] = useState([])
  const [filterByToSet, setFilterByToSet] = useState(
    stationService.getDefaultFilter()
  )
  const [allStations, setAllStations] = useState([])
  const [stations, setStations] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function onCreateNewStation() {
    const emptyStation = stationService.getEmptyStation()
    emptyStation.items = []
    try {
      const newStation = await saveStation(emptyStation)
      navigate(`/station/${newStation._id}`)
    } catch (err) {
      console.log(err)
    }
  }

  const handleChange = utilService.debounce(({ target }) => {
    const field = target.name

    let value = target.value

    setFilterByToSet({ ...filterByToSet, txt: value })
    // Dispatch action to update the filter in the Redux store
    // dispatch({
    //   type: SET_FILTER_BY,
    //   filterBy: {
    //     ...filterBy,
    //     [field]: value,
    //   },
    // })

    // Reload the stations with the updated filter
    // loadStations() stopped the filtering of the stations on the side.
  }, 800) // Debounce with a 300ms delay


  return (
    <section className='section home-container' ref={pageRef}>
      <div className='mobile-library-header'>
        <div className='mobile-library-header'>
          <h1>Your Library</h1>
        </div>

        <div className='plus-search'>
          <button>
            <FaPlus className='plus-icon' onClick={onCreateNewStation} />
          </button>

          <div className='playlist-input-container'>
            <IoSearchOutline
              className='icon search'
              onClick={() => {
                setIsSearchOpen(true)
                inputRef.current.focus()
              }}
            />

            {isSearchOpen && (
              <IoCloseOutline
                className='icon clear'
                onClick={() => {
                  inputRef.current.value = ''
                  setFilterByToSet({ ...filterByToSet, txt: '' })
                  setIsSearchOpen(false)
                }}
              />
            )}
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className='library-search-container'>
          <input
            className='library-search'
            type='text'
            name='txt'
            id=''
            ref={inputRef}
            placeholder='Search in your library'
            value={filterByToSet.txt}
            onChange={handleChange}
          />
        </div>
      )}

      <div className='gradient-container' ref={gradientRefOne}></div>
      <Sort setFiltered={setFiltered} />
      <StationList gradientRefOne={gradientRefOne} filtered={filtered} />
      <SuggestedStations stations={allStations} color={'#4a0e8b00'} />
      <SuggestedStations stations={stations} />
      <Footer />
    </section>
  )
}