import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'

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

import { PlayingAnimation } from './PlayingAnimation.jsx'

import { LuClock3 } from 'react-icons/lu'
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

import { FiEdit2 } from 'react-icons/fi'
import { CiCircleMinus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'

import { utilService } from '../services/util.service.js'

import { HiOutlineDotsHorizontal } from 'react-icons/hi'

export function PlayList({ station }) {
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const currItem = useSelector(
    (stateSelector) => stateSelector.stationModule.currItem
  )
  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const isHover = useRef(false)
  const [likedItems, setLikedItems] = useState([])
  console.log(currStation)

  function onSelectStation(itemId) {
    setCurrStation(currStation._id)
    setCurrItem(itemId, currStation)
    setIsPlaying(true)
  }
  return (
    <div className='playlist-container'>
      <div className='controller-container'>
        <span>Queue</span>
        <button>
          <IoClose />
        </button>
      </div>
      <div className='songs-container'>
        {currStation.items.map((item) => {
          return (
            <div
              className='song-container'
              key={item.id}
              onClick={() => {
                if (isHover.current) return
                // navigate(`station/${station._id}`)
              }}
            >
              <div className='img-container'>
                {(isPlaying && item.id === currItem.id && (
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
                        //   if (currStation._id === station._id) {
                        //   return
                        // }
                        setIsPlaying(true)
                        onSelectStation(item.id)
                      }}
                    />
                  </div>
                )}
                <img src={item.cover} alt='' />
              </div>
              <div className='info-container'>
                <b
                  className={
                    currItem.id === item.id
                      ? `station-name playing`
                      : 'station-name'
                  }
                >
                  {item.name}
                </b>
                <div className='playlist-details'>
                  <span>{item.artist}</span>
                </div>
              </div>

              {(currItem.id === item.id && (
                <HiOutlineDotsHorizontal
                  className='dots'
                  onClick={() => {
                    setItemToEdit(item)
                    optionsState.current = 'song'
                    openSongOptions(event, item)
                  }}
                  style={{ opacity: '1' }}
                />
              )) || (
                <HiOutlineDotsHorizontal
                  className='dots'
                  onClick={() => {
                    setItemToEdit(item)
                    optionsState.current = 'song'
                    openSongOptions(event, item)
                  }}
                />
              )}
            </div>
          )
        })}{' '}
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon plus'
    >
      <path d='M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z'></path>
      <path d='M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H5a.75.75 0 0 1 0-1.5h2.25V5a.75.75 0 0 1 1.5 0v2.25H11a.75.75 0 0 1 .75.75z'></path>
    </svg>
  )
}
function AddedIcon() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon added'
    >
      <path d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z'></path>
    </svg>
  )
}
