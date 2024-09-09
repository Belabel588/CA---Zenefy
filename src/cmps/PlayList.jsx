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
import { EditOptions } from './EditOptions.jsx'

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
  const stations = useSelector(
    (stateSelector) => stateSelector.stationModule.stations
  )

  const isHover = useRef(false)
  const [likedItems, setLikedItems] = useState([])

  const [pageStation, setPageStation] = useState(currStation)

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  useEffect(() => {
    setPageStation(currStation)
  }, [currStation])

  function onSelectStation(itemId) {
    setCurrStation(currStation._id)
    setCurrItem(itemId, currStation)
    setIsPlaying(true)
  }
  async function setLikedStation() {
    // await loadStations()

    const like = stations.find(
      (station) => station.isLiked && station.createdBy._id === user._id
    )

    const items = like.items || []
    const itemsId = items.map((item) => {
      return item.id
    })
    setLikedItems(itemsId)
  }
  const optionsState = useRef()
  let options
  const [itemToEdit, setItemToEdit] = useState({})

  optionsState.current === 'station'
    ? (options = [
        {
          text: 'Edit',
          icon: <FiEdit2 />,
          onClick: () => {
            setIsVisible(false)

            toggleModal()
          },
        },
        {
          text: 'Add Playlist',
          icon: <PlusIcon />,
          onClick: () => {
            onAddStation(station)
          },
        },
        {
          text: 'Delete',
          icon: <CiCircleMinus />,
          onClick: () => {
            setIsVisible(false)

            onDeleteStation(station)
          },
        },
        {
          text: 'Create',
          icon: <FaPlus />,
          onClick: () => {
            setIsVisible(false)

            onCreateNewStation()
          },
        },
      ])
    : (options = [
        {
          text: 'Add to playlist',
          icon: <FaPlus />,
          onClick: () => {},
          onClick: () => {},
        },
        {
          text: 'Remove from playlist',
          icon: <CiCircleMinus />,
          onClick: () => {},
          onClick: () => {},
        },
      ])
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const handleRightClick = (event) => {
    if (station.isLiked) return
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY })

    setIsVisible(true)
  }

  const handleClickOutside = () => {
    setIsVisible(false)
  }

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
  async function onDeleteStation(stationToDelete) {
    if (stationToDelete.isLiked === true) return

    try {
      await removeStation(station._id)
      navigate('/')
    } catch (err) {
      console.log(err)
    }
  }
  function openSongOptions(event, item) {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY })

    setIsVisible(true)
  }
  const [addToPlaylist, setAddToPlaylist] = useState(false)
  const [create, setCreate] = useState(false)
  const [removeFromPlaylist, setRemoveFromPlaylist] = useState(false)

  async function onAddStation(station) {
    const stationId = station._id
    if (user.likedStationsIds.includes(stationId)) return

    try {
      user.likedStationsIds.unshift(stationId)
      const userToSave = { ...user }
      const savedUser = await updateUser(userToSave)
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <>
      <div className='playlist-container'>
        <div className='controller-container'>
          <span>Queue</span>
          <button>
            <IoClose />
          </button>
        </div>
        <div className='songs-container'>
          {pageStation.items.map((item) => {
            return (
              <div
                className='song-container'
                key={item.id}
                onDoubleClick={() => {
                  if (isHover.current) return

                  onSelectStation(item.id)
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
                          if (currItem.id === item.id) {
                            setIsPlaying(true)
                            return
                          } else {
                            onSelectStation(item.id)
                          }
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
      </div>{' '}
      <EditOptions
        setLikedStation={setLikedStation}
        options={options}
        station={station}
        position={position}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onDeleteStation={onDeleteStation}
        onCreateNewStation={onCreateNewStation}
        addToPlaylist={addToPlaylist}
        setAddToPlaylist={setAddToPlaylist}
        userStations={stations}
        create={create}
        setCreate={setCreate}
        removeFromPlaylist={removeFromPlaylist}
        setRemoveFromPlaylist={setRemoveFromPlaylist}
        optionsState={optionsState}
        handleClickOutside={handleClickOutside}
        itemToEdit={itemToEdit}
        pageStation={pageStation}
        setStation={setPageStation}
      />
    </>
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
