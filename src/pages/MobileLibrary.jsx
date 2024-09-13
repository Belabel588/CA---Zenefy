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
  setFilter,
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
import { IoSearch } from 'react-icons/io5'

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

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )

  const currFilter = useSelector(
    (stateSelector) => stateSelector.stationModule.filterBy
  )

  const isHover = useRef(false)
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

  useEffect(() => {
    loadStations()
    // setUpdatedStations(stations)
  }, [currFilter])

  useEffect(() => {
    setFilter(filterByToSet)
    console.log(filterByToSet)
  }, [filterByToSet])

  const handleChange = utilService.debounce(({ target }) => {
    const field = target.name

    let value = target.value

    setFilterByToSet({ ...filterByToSet, txt: value })
  }, 800) // Debounce with a 300ms delay

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }

  return (
    <section className='section mobile-library-container' ref={pageRef}>
      <div className='mobile-library-header'>
        <div className='plus-search'>
          <button>
            <FaPlus className='plus-icon' onClick={onCreateNewStation} />
          </button>

          <div className='playlist-input-container'>
            <IoSearch
              className='icon search'
              onClick={() => {
                inputRef.current.focus()
              }}
            />

            <input
              type='text'
              name='txt'
              id=''
              ref={inputRef}
              placeholder='Search in your library'
              // value={filterByToSet.txt}
              onChange={handleChange}
            />
            {filterByToSet.txt && (
              <IoCloseOutline
                className='icon clear'
                onClick={() => {
                  inputRef.current.value = ''
                  setFilterByToSet({ ...filterByToSet, txt: '' })
                }}
              />
            )}
          </div>
        </div>
      </div>
      <Sort setFiltered={setFiltered} />

      {/* {isSearchOpen && (
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
      )} */}

      <div className='gradient-container' ref={gradientRefOne}></div>

      {/* <StationList gradientRefOne={gradientRefOne} filtered={filtered} /> */}
      <div className='library-stations-container'>
        {filtered.map((station, idx) => {
          return (
            <div className='station-container' key={station._id}>
              <div className='img-container'>
                {(isPlaying && currStation._id === station._id && (
                  <div
                    className='pause-button-container'
                    onMouseEnter={() => {
                      isHover.current = true
                    }}
                    onMouseLeave={() => {
                      isHover.current = false
                    }}
                  >
                    <BiPause
                      className='pause-button'
                      onClick={() => setIsPlaying(false)}
                    />
                  </div>
                )) || (
                  <div
                    className='play-button-container'
                    onMouseEnter={() => {
                      isHover.current = true
                    }}
                    onMouseLeave={() => {
                      isHover.current = false
                    }}
                  >
                    {' '}
                    <BiPlay
                      className='play-button'
                      onClick={() => {
                        if (station.items.length === 0) return
                        if (currStation._id === station._id) {
                          setIsPlaying(true)
                          return
                        }
                        onSelectStation(station._id)
                      }}
                    />
                  </div>
                )}
                <img src={station.cover} alt='' />
              </div>
              <div
                className='info-container'
                onClick={() => {
                  navigate(`/station/${station._id}`)
                }}
              >
                <b
                  className={
                    currStation._id === station._id
                      ? `station-name playing`
                      : 'station-name'
                  }
                >
                  {station.title}
                </b>
                <div className='playlist-details'>
                  <span>Playlist</span>
                  {(station.items.length && (
                    <span>
                      {station.items.length}{' '}
                      {station.stationType === 'podcast' ? 'podcasts' : 'songs'}
                    </span>
                  )) || <span>0 songs</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <SuggestedStations stations={allStations} color={'#4a0e8b00'} />
      <SuggestedStations stations={stations} />
      <Footer />
    </section>
  )
}
