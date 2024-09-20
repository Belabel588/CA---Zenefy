import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
  setIsLoading,
} from '../store/actions/station.actions.js'

import { PlayingAnimation } from './PlayingAnimation.jsx'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

export function SuggestedStations({ stations = '', color = '' }) {
  const navigate = useNavigate()
  const isHover = useRef(false)
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }

  // console.log('stations inside suggested stations',stations);

  // Use default color if none is provided
  const backgroundColor = color || '#191414' // Default color

  // Determine class names dynamically
  const containerClass = color
    ? 'suggested-stations-container gradientt'
    : 'suggested-stations-container'

  let counter = 0
  return (
    <div className={containerClass} style={{ backgroundColor }}>
      {stations.map((station) => {
        if (counter >= 8) return
        counter++
        let artists = ''
        return (
          <div
            to={`/station/${station._id}`}
            className='station-container'
            key={station._id}
            onClick={() => {
              if (isHover.current) return
              navigate(`/station/${station._id}`)
            }}
            // Apply the background color here
          >
            <div className='cover-container'>
              <div className='playlist-cover-overlay'></div>
              <img className='station-cover' src={station.cover} alt='' />
              <span className='title'>{station.title}</span>
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
            <span className='artists'>
              {station.items
                .reduce(
                  (accu, currItem) => `${accu} ${currItem.artist},`,
                  artists
                )
                .slice(0, 20) + '...'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Waves({ cover, title }) {
  return (
    <div className='station-cover-container'>
      <img src={cover} alt={title} className='station-cover-image' />
      <div className='station-cover-overlay'>
        <svg viewBox='0 0 1440 320'>
          <path
            fill='#0099ff'
            fillOpacity='0.8'
            d='M0,96L1440,224L1440,320L0,320Z'
          ></path>
          <path
            fill='#ff0099'
            fillOpacity='0.8'
            d='M0,224L1440,96L1440,320L0,320Z'
          ></path>
        </svg>
      </div>
      <div className='station-title'>{title}</div>
    </div>
  )
}
