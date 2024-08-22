import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'

import {
  SET_STATIONS,
  REMOVE_STATION,
  UPDATE_STATION,
  ADD_STATION,
} from '../store/reducers/station.reducer.js'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/stations.service.js'
import { userService } from '../services/user.service.js'

import { SongList } from '../cmps/SongList.jsx'
import { SongFilter } from '../cmps/SongFilter.jsx'
import {
  loadStations,
  removeStation,
} from '../store/actions/station.actions.js'
import { GoContainer } from 'react-icons/go'

import { FaCirclePlay } from 'react-icons/fa6'

export function HomePage() {
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  console.log(stations)

  function onSelectStation(stationId, ev) {
    console.log(ev)
    ev.preventDefault()
    console.log(stationId)
  }

  return (
    <section className='section home-container'>
      <div className='filter-container'>
        <button>bla</button>
        <button>bla</button>
        <button>bla</button>
      </div>
      <div className='stations-container'>
        {stations.map((station) => {
          return (
            <Link to={`/song`}>
              <div className='station-container' key={station.id}>
                <img className='station-cover' src={station.imgUrl} alt='' />
                <span>{station.title}</span>
                <div
                  className='play-button-container'
                  onClick={() => {
                    onSelectStation(station.id, event)
                  }}
                >
                  <FaCirclePlay className='play-button' />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
