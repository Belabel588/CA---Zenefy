import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'

import { login } from '../store/actions/user.actions.js'
import { store } from '../store/store.js'
import { showSuccessMsg } from '../services/event-bus.service.js'
import { FastAverageColor } from 'fast-average-color'
import {
  socketService,
  SOCKET_EVENT_USER_UPDATED,
  SOCKET_EMIT_USER_WATCH,
} from '../services/socket.service.js'
import { setCurrColor } from '../store/actions/station.actions.js'
import { stationService } from '../services/station.service.js'
import { utilService } from '../services/util.service.js'
import { apiService } from '../services/youtube-spotify.service.js'

import { SuggestedStations } from '../cmps/SuggestedStations.jsx'
import { SuggestedArtists } from '../cmps/SuggestedArtists.jsx'

export function UserDetails() {
  const params = useParams()
  const user = useSelector((storeState) => storeState.userModule.loggedinUser)
  const headerRef = useRef()
  const currColor = useSelector(
    (storeState) => storeState.stationModule.currColor
  )
  const [randomArtists, setRandomArtists] = useState([])
  const [randomStations, setRandomStations] = useState([])

  useEffect(() => {
    // logInUser(params.id)
    // socketService.emit(SOCKET_EMIT_USER_WATCH, params.id)
    // socketService.on(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
    // return () => {
    //   socketService.off(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
    // }

    const loadUser = async () => {
      try {
        const hex = await setCurrColor(user.imgUrl)
        headerRef.current.style.backgroundColor = hex
      } catch (err) {
        console.log(err)
      }
    }
    loadUser()
    loadRandomArtists()
    loadRandomStations()
    // console.log(user)
  }, [params.id])

  function onUserUpdate(user) {
    showSuccessMsg(
      `This user ${user.fullname} just got updated from socket, new score: ${user.score}`
    )
    store.dispatch({ type: 'SET_WATCHED_USER', user })
  }

  async function loadRandomStations() {
    const stations = await stationService.query({ stationType: 'music' })
    const filtered = stations.filter(
      (station) => !station.isLiked || station.isLiked === undefined
    )

    let numStationsToReturn
    const idxsToExclude = []

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
    setRandomStations(stationsToReturn)
  }
  async function loadRandomArtists() {
    const artist = stationService.getRandomArtist()

    const artists = await apiService.getArtistByName(artist)
    setRandomArtists(artists)
  }

  return (
    <section className='user-details'>
      {user && (
        <div className='user-header-container' ref={headerRef}>
          <img src={user.imgUrl} className='user-img' alt='' />
          <div className='title-container'>
            <span>Profile</span>
            <b className='user-name'>{user.fullname}</b>

            <span className='user-stations'>
              {`${user.likedStationsIds.length} playlists`}
            </span>
          </div>
        </div>
      )}
      <div className='artists'>
        <b className='suggest'>Top artists</b>
        <SuggestedArtists artists={randomArtists} />
      </div>
      <div className='stations'>
        <b className='suggest'>Your top picks</b>
        <SuggestedStations stations={randomStations} />
      </div>
    </section>
  )
}
