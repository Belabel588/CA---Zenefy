import { FaPlus } from 'react-icons/fa6'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'
import { stationService } from '../services/station.service'
import { utilService } from '../services/util.service.js'
import { loadStations } from '../store/actions/station.actions'
import {
  setIsPlaying,
  setCurrStation,
  setCurrItem,
  saveStation,
  setFilter,
} from '../store/actions/station.actions.js'

import { StationEditModal } from './StationEditModal.jsx'
import { StationList } from '../cmps/StationList.jsx'
import { Sort } from './Sort.jsx'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { IoSearch } from 'react-icons/io5'
import { IoCloseOutline } from 'react-icons/io5'

export function AppLibrary() {
  const dispatch = useDispatch()
  const [defaultFilter, setFilterBy] = useState(
    stationService.getDefaultFilter()
  )
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  const navigate = useNavigate()

  const [filtered, setFiltered] = useState([])
  const [filterByToSet, setFilterByToSet] = useState(
    stationService.getDefaultFilter()
  )

  const currFilter = useSelector(
    (stateSelector) => stateSelector.stationModule.filterBy
  )

  const inputRef = useRef()

  useEffect(() => {
    loadStations()
  }, [currFilter])

  useEffect(() => {
    //   loadStations()
    // dispatch({ type: SET_FILTER_BY, filterBy: defaultFilter })
    //   setStationToSet(stations)
  }, [stations])

  useEffect(() => {
    console.log(filterByToSet)
    setFilter(filterByToSet)
  }, [filterByToSet])

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

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
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

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }

  return (
    <div className='library-container'>
      <div className='library-header'>
        <div className='library-title'>
          <svg
            className='library-icon'
            xmlns='http://www.w3.org/2000/svg'
            role='img'
            height='24'
            width='24'
            aria-hidden='true'
            viewBox='0 0 24 24'
            data-encore-id='icon'
          >
            <path
              d='M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z'
              fill='#b3b3af'
            ></path>
          </svg>
          <p className='library-text'>Your Library</p>
        </div>

        <button>
          <FaPlus className='plus-icon' onClick={onCreateNewStation} />
        </button>
      </div>
      <Sort setFiltered={setFiltered} isNav={true} />
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
      <div className='library-stations-container'>
        {filtered.map((station) => {
          return (
            <div
              className='station-container'
              key={station._id}
              onClick={() => {
                if (isHover.current) return
                navigate(`station/${station._id}`)
              }}
            >
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
              <div className='info-container'>
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
                      {station.stationType !== 'music' ? 'podcasts' : 'songs'}
                    </span>
                  )) || <span>0 songs</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
