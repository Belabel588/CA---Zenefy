import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'

import { StationEditModal } from '../cmps/StationEditModal.jsx'
import { EditOptions } from '../cmps/EditOptions.jsx'
import { PlayingAnimation } from '../cmps/PlayingAnimation.jsx'

import {
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
  saveStation,
  removeStation,
  setCurrItemIdx,
  loadStations,
} from '../store/actions/station.actions.js'

import { updateUser } from '../store/actions/user.actions.js'

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
import { utilService } from '../services/util.service.js'

import { HiOutlineDotsHorizontal } from 'react-icons/hi'

// import playingAnimation from '../../public/img/playing.gif'

export function StationDetails() {
  const navigate = useNavigate()
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const currItem = useSelector(
    (stateSelector) => stateSelector.stationModule.currItem
  )

  const { stationId } = useParams()

  const [station, setStation] = useState({ items: [{ id: '' }] })

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )
  const isLoading = useSelector(
    (stateSelector) => stateSelector.stationModule.isLoading
  )

  const isHover = useRef(false)
  let counter = 0

  const stations = useSelector(
    (stateSelector) => stateSelector.stationModule.stations
  )

  const pageRef = useRef()
  const modalRef = useRef()

  const currColor = useSelector(
    (stateSelector) => stateSelector.stationModule.currColor
  )

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  const [currPageColor, setCurrColorPage] = useState(currColor)

  const [likedItems, setLikedItems] = useState([])

  // useEffect(() => {
  //   loadStation(stationId)
  //   // setCoverColor()
  //   // loadSong(songId)
  // }, [stationId, currColor])

  useEffect(() => {
    const setCoverColor = async () => {
      try {
        await loadStation(stationId)
        await setCurrColor(station.cover)
        pageRef.current.style.background = `linear-gradient(0deg, #191414 60%, ${currColor} 90%, ${currColor} 100%)`
        // setCurrColorPage((prev) => (prev = currColor))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    setLikedStation()
    console.log(stations)
    setCoverColor()
  }, [stationId])

  async function loadStation(stationId) {
    const stationToSet = await stationService.getById(stationId)

    setStation(stationToSet)
  }

  async function onPlaySong(songId) {
    const stationToSet = { ...station }
    await setCurrStation(stationToSet._id)
    await setCurrItem(songId, { ...station }, true)
    const idxToSet = stationToSet.items.findIndex((item) => item.id === songId)
    console.log(idxToSet)
    setCurrItemIdx(idxToSet)
    setIsPlaying(true)
  }

  function toggleModal() {
    if (station.isLiked) return
    if (modalRef.current.style.display !== 'flex') {
      modalRef.current.style.display = 'flex'
    } else {
      modalRef.current.style.display = 'none'
    }
  }

  async function sendToSaveStation(stationToSave) {
    const newStation = await saveStation(stationToSave)
    setStation(newStation)
  }
  const editRef = useRef()
  async function onDeleteStation(stationToDelete) {
    if (stationToDelete.isLiked === true) return

    try {
      await removeStation(station._id)
      navigate('/')
    } catch (err) {
      console.log(err)
    }
  }

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

  const options = [
    {
      text: 'Edit',
      icon: <FiEdit2 />,
      onClick: () => {
        toggleModal()
      },
    },
    {
      text: 'Delete',
      icon: <CiCircleMinus />,
      onClick: () => {
        onDeleteStation(station)
      },
    },
    {
      text: 'Create',
      icon: <FaPlus />,
      onClick: () => {
        onCreateNewStation()
      },
    },
  ]

  async function setLikedStation() {
    await loadStations()

    const like = stations.find((station) => station.isLiked)
    console.log(like)
    const items = like.items
    const itemsId = items.map((item) => {
      return item.id
    })
    setLikedItems(itemsId)
    console.log(likedItems)
  }

  async function likeSong(itemToAdd) {
    console.log(user)
    if (itemToAdd.url === '') return
    if (!user) return

    const likedStation = stations.find((station) => station.isLiked)
    const likedSongsIds = user.likedSongsIds
    if (user.likedSongsIds.includes(itemToAdd.id)) {
      const idx = likedStation.items.findIndex(
        (item) => item.id === itemToAdd.id
      )
      likedStation.items.splice(idx, 1)
      const songIdx = likedSongsIds.findIndex((id) => id === itemToAdd.id)
      likedSongsIds.splice(songIdx, 1)
    } else {
      likedStation.items.push(itemToAdd)
      likedSongsIds.push(itemToAdd.id)
    }

    try {
      await saveStation(likedStation)
      const userToSave = { ...user, likedSongsIds }
      await updateUser(userToSave)
      setLikedStation()
    } catch (err) {
      console.log(err)
    }
  }

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }

  if (!isLoading)
    return (
      <section
        className='station-details-container'
        ref={pageRef}
        onClick={handleClickOutside}
      >
        <StationEditModal
          station={station}
          modalRef={modalRef}
          toggleModal={toggleModal}
          saveStation={sendToSaveStation}
        />
        <EditOptions
          options={options}
          station={station}
          toggleModal={toggleModal}
          editRef={editRef}
          position={position}
          isVisible={isVisible}
          onDeleteStation={onDeleteStation}
          onCreateNewStation={onCreateNewStation}
        />

        <header className='station-header' onContextMenu={handleRightClick}>
          <img className='station-cover' src={station.cover} />

          <div className='title-container'>
            <span>Playlist</span>
            <b className='station-title' onClick={toggleModal}>
              {station.title}
            </b>
            {(station.preview && (
              <p className='playlist-summery'>{station.preview}</p>
            )) || <p className='playlist-summery'>Playlist summery here</p>}
            <span className='playlist-artist'>Playlist artist here</span>
          </div>
        </header>
        <div className='user-interface-container'>
          <div className='buttons-container'>
            <div className='play-container'>
              <div className='play-button-container'>
                {(isPlaying && currStation._id === station._id && (
                  <BiPause
                    className='pause-button'
                    onClick={() => setIsPlaying(false)}
                  />
                )) || (
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
                )}
              </div>
              <RxPlusCircled className='option-button plus-button' />
              <BsThreeDots className='option-button more-button' />
            </div>
            <div className='list-container'>
              <span>List</span>
              <IoListSharp />
            </div>
          </div>
          <div className='items-container'>
            <div className='info-container'>
              <div className='title-container'>
                <span>#</span>
                <span>Title</span>
              </div>
              <span className='album'>Album</span>
              <span className='date-added span'>Date Added</span>
              <LuClock3 className='time' />
            </div>
            {station.items.map((item) => {
              return (
                <div
                  className='song-container'
                  key={item.id}
                  onDoubleClick={() => {
                    onPlaySong(item.id)
                  }}
                  onMouseEnter={() => {
                    isHover.current = true
                  }}
                  onMouseLeave={() => {
                    isHover.current = false
                  }}
                >
                  {/* <div className='song-title-container'> */}
                  <div className='idx-play-container'>
                    <div className='item-idx-container'>
                      {currItem.id === item.id ? (
                        <PlayingAnimation />
                      ) : (
                        <span className='item-idx'>{++counter}</span>
                      )}
                    </div>
                    <div className='play-pause-container'>
                      {currItem.id === item.id && isPlaying ? (
                        <BiPause
                          className='pause-button'
                          onClick={() => {
                            setIsPlaying(false)
                          }}
                        />
                      ) : (
                        <BiPlay
                          className='play-button'
                          onClick={async () => {
                            if (
                              JSON.stringify(currItem) !== JSON.stringify(item)
                            ) {
                              await setCurrStation(station._id)
                              await setCurrItem(item.id, station)
                            }

                            setIsPlaying(true)
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <img src={item.cover} alt='' />
                  <div className='name-artist-container'>
                    <Link
                      to={`/item/${item.id}`}
                      className={
                        currItem.id === item.id
                          ? `song-name playing`
                          : 'song-name'
                      }
                    >
                      {item.name}
                    </Link>
                    <span>{item.artist}</span>
                    {/* </div> */}
                  </div>
                  <span className='album'>{item.album}</span>
                  <span>
                    {Date(item.addedAt).toLocaleString('he').slice(0, 13)}
                  </span>
                  <span className='time' key={utilService.makeId()}>
                    {'3:33'}
                  </span>
                  <button
                    onClick={() => likeSong(item)}
                    className='like-button'
                  >
                    {(likedItems.includes(item.id) && (
                      <AddedIcon className={'added'} />
                    )) || <PlusIcon className={'to-add'} />}
                  </button>
                  <HiOutlineDotsHorizontal />
                </div>
              )
            })}
          </div>{' '}
        </div>
      </section>
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
