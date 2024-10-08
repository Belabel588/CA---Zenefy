import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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
  setPlaylist,
  setCurrItemIdx,
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
import { HiOutlineDotsHorizontal } from 'react-icons/hi'

import { utilService } from '../services/util.service.js'

export function PlayList({ station }) {
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const currItem = useSelector(
    (stateSelector) => stateSelector.stationModule.currItem
  )
  const currItemIdx = useSelector(
    (stateSelector) => stateSelector.stationModule.currItemIdx
  )
  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )
  const stations = useSelector(
    (stateSelector) => stateSelector.stationModule.stations
  )
  const isPlaylistShown = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaylistShown
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
    setCurrStation(currStation._id, updated)
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

  function onCloseQueue() {
    setPlaylist(false)
  }
  const [draggedItem, setDraggedItem] = useState(null)
  const [updated, setUpdated] = useState()

  // const onDragStart = (event, index) => {
  //   setDraggedItem(index)
  //   event.target.style.opacity = '1'
  //   event.target.style.borderBottom = '2px solid #1DB954'
  // }

  // const onDragOver = (event) => {
  //   event.preventDefault() // allow dropping
  //   event.target.style.opacity = '1'
  //   event.target.style.borderBottom = '0px solid black'
  // }

  // const onDrop = async (event, index) => {
  //   let updatedStation = { ...pageStation }
  //   const dragged = updatedStation.items.splice(draggedItem, 1)[0] // remove the dragged item

  //   updatedStation.items.splice(index, 0, dragged) // insert it
  //   setPageStation(updatedStation)
  //   setUpdated(updatedStation)
  //   if (currItem.id === dragged.id) {
  //     setCurrItemIdx(index)
  //   }
  //   setDraggedItem(null)
  // }
  const handleOnDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(pageStation.items)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    const stationToSet = { ...pageStation, items }

    const prevIdx = currItemIdx
    const playedItem = pageStation.items[prevIdx]
    setPageStation(stationToSet)
    setCurrStation(stationToSet._id, stationToSet)
    const newIdx = stationToSet.items.findIndex(
      (item) => item.id === playedItem.id
    )
    if (currItem.id === result.draggableId) {
      setCurrItemIdx(result.destination.index)
    } else {
      setCurrItemIdx(newIdx)
    }
  }

  return (
    <>
      <div className='playlist-container animate'>
        <div className='controller-container'>
          <span>Queue</span>
          <button
            onClick={() => {
              onCloseQueue()
            }}
          >
            <IoClose />
          </button>
        </div>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId='songs'>
            {(provided) => (
              <div
                className='songs-container'
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {pageStation.items.map((item, idx) => {
                  return (
                    <Draggable draggableId={item.id} key={item.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          className={
                            snapshot.isDragging
                              ? 'song-container dragged'
                              : 'song-container'
                          }
                          onDoubleClick={() => {
                            if (isHover.current) return

                            onSelectStation(item.id)
                          }}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          // draggable
                          // onDragStart={(event) => onDragStart(event, idx)}
                          // onDragOver={onDragOver}
                          // onDrop={(event) => onDrop(event, idx)}
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
                      )}
                    </Draggable>
                  )
                })}{' '}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
