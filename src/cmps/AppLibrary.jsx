import { FaPlus } from 'react-icons/fa6'
import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { stationService } from '../services/stations.service'
import { loadStations } from '../store/actions/station.actions'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'

import {
  setIsPlaying,
  setCurrentlyPlayedStation,
} from '../store/actions/station.actions.js'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

export function AppLibrary() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currentlyPlayedStation
  )

  const navigate = useNavigate()

  useEffect(() => {
    loadStations(filterBy)
  }, [filterBy])

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const isHover = useRef(false)

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
          <FaPlus className='plus-icon' />
        </button>
      </div>

      <div className='library-stations-container'>
        {stations.map((station) => {
          return (
            <div
              className='station-container'
              key={station.stationId}
              onClick={() => {
                if (isHover.current) return
                navigate(`station/${station.stationId}`)
              }}
            >
              <div className='img-container'>
                {(isPlaying && currStation.stationId === station.stationId && (
                  <div
                    className='pause-button-container'
                    onMouseEnter={() => {
                      console.log(isHover.current)
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
                        setCurrentlyPlayedStation(station.stationId)
                        setIsPlaying(true)
                      }}
                    />
                  </div>
                )}
                <img src={station.imgUrl} alt='' />
              </div>
              <div className='info-container'>
                <b>{station.title}</b>
                <div className='playlist-details'>
                  <span>Playlist</span>
                  <span>{station.songs.length} songs</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
