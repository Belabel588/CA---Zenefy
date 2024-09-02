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
} from '../store/actions/station.actions.js'

import { PlayingAnimation } from './PlayingAnimation.jsx'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

export function SuggestedStations({ stations }) {
  const navigate = useNavigate()
  const isHover = useRef(false)
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

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }
  let counter = 0
  return (
    <div className='suggested-stations-container'>
      {/* {stations.map((station) => {
        return (
          <div className='station-container' key={station._id}>
            <div className='cover-container'>
              <img src={station.cover} alt='' />
              <Link to={`station/${station._id}`}>{station.title}</Link>
            </div>
          </div>
        )
      })} */}
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
          >
            <div className='cover-container'>
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
                .slice(0, 150) + '...'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
