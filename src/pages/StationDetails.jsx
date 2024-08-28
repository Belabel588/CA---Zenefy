import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'

import { StationEditModal } from '../cmps/StationEditModal.jsx'
import { EditOptions } from '../cmps/EditOptions.jsx'

import {
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
  saveStation,
  removeStation,
} from '../store/actions/station.actions.js'

import { LuClock3 } from 'react-icons/lu'
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { utilService } from '../services/util.service.js'

import playingAnimation from '../../public/img/playing.gif'

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

  const isHover = useRef(false)
  let counter = 0

  const pageRef = useRef()
  const modalRef = useRef()

  const currColor = useSelector(
    (stateSelector) => stateSelector.stationModule.currColor
  )
  const [currPageColor, setCurrColorPage] = useState(currColor)

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

    setCoverColor()
  }, [stationId])

  async function loadStation(stationId) {
    const stationToSet = await stationService.getById(stationId)

    setStation(stationToSet)
  }

  async function onPlaySong(songId) {
    await setCurrStation(station._id)
    await setCurrItem(songId, station)
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

  function toggleEdit() {
    if (editRef.current.style.display !== 'flex') {
      editRef.current.style.display = 'flex'
    } else {
      editRef.current.style.display = 'none'
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
        station={station}
        toggleModal={toggleModal}
        editRef={editRef}
        position={position}
        isVisible={isVisible}
        onDeleteStation={onDeleteStation}
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
                    setIsPlaying(true)
                    setCurrStation(station._id)
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
            <span>Album</span>
            <span className='date-added span'>Date Added</span>
            <LuClock3 className='time' />
          </div>
          {station.items.map((item) => {
            return (
              <div
                className='song-container'
                key={item.id}
                onDoubleClick={() => onPlaySong(item.id)}
                onMouseEnter={() => {
                  isHover.current = true
                }}
                onMouseLeave={() => {
                  isHover.current = false
                }}
              >
                <div key={item.id} className='song-title-container'>
                  <div className='idx-play-container'>
                    <div className='item-idx-container'>
                      {currItem.id === item.id ? (
                        <img
                          className='playing-animation'
                          src={playingAnimation}
                          alt=''
                        />
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
                              JSON.stringify(currStation) !==
                              JSON.stringify(station)
                            ) {
                              await setCurrStation(station._id)
                            }
                            await setCurrItem(item.id, station)

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
                  </div>
                </div>
                <span>{item.album}</span>
                <span>{station.addedAt}</span>
                <span className='time' key={utilService.makeId()}>
                  {'3:33'}
                </span>
              </div>
            )
          })}
        </div>{' '}
      </div>
    </section>
  )
}
