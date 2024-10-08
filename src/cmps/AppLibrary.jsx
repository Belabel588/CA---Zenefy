import { FaPlus } from 'react-icons/fa6'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'
import { stationService } from '../services/station.service'
import { utilService } from '../services/util.service.js'
import { loadStations, setIsLoading } from '../store/actions/station.actions'
import {
  setIsPlaying,
  setCurrStation,
  setCurrItem,
  saveStation,
  setFilter,
} from '../store/actions/station.actions.js'
import { updateUser } from '../store/actions/user.actions.js'

import { apiService } from '../services/youtube-spotify.service.js'

import { StationEditModal } from './StationEditModal.jsx'
import { StationList } from '../cmps/StationList.jsx'
import { Sort } from './Sort.jsx'
import { GeminiChat } from '../pages/GeminiChat.jsx'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { IoSearch } from 'react-icons/io5'
import { IoCloseOutline } from 'react-icons/io5'
import { LuSparkles } from 'react-icons/lu'

export function AppLibrary() {
  const dispatch = useDispatch()
  const [defaultFilter, setFilterBy] = useState(
    stationService.getDefaultFilter()
  )
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  const navigate = useNavigate()

  const [filtered, setFiltered] = useState([])
  const [filterByToSet, setFilterByToSet] = useState(
    stationService.getDefaultFilter()
  )

  const currFilter = useSelector(
    (stateSelector) => stateSelector.stationModule.filterBy
  )

  const isLoading = useSelector(
    (stateSelector) => stateSelector.stationModule.isLoading
  )

  const [generateButton, setGenerateButton] = useState()
  const inputRef = useRef()
  const [geminiLoader, setGeminiLoader] = useState(false)

  useEffect(() => {
    loadStations()
    // setUpdatedStations(stations)
  }, [currFilter])

  useEffect(() => {
    //   loadStations()
    // dispatch({ type: SET_FILTER_BY, filterBy: defaultFilter })
    //   setStationToSet(stations)
  }, [])

  useEffect(() => {
    setFilter(filterByToSet)
  }, [filterByToSet])

  const handleChange = utilService.debounce(({ target }) => {
    const field = target.name

    let value = target.value

    setFilterByToSet({ ...filterByToSet, txt: value })
  }, 800) // Debounce with a 300ms delay

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const isHover = useRef(false)

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

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }

  const [draggedItem, setDraggedItem] = useState(null)
  const [updated, setUpdated] = useState()
  // const [updatedStations, setUpdatedStations] = useState()

  const handleOnDragEnd = (result) => {
    if (!result.destination) return

    const stationsArray = Array.from(stations)
    let updatedStations = [...stationsArray]
    const [reorderedStation] = stationsArray.splice(result.source.index, 1)
    stationsArray.splice(result.destination.index, 0, reorderedStation)
    setFiltered([...stationsArray])
    try {
      const newStationsOrder = []
      stationsArray.map((station, idx) => {
        newStationsOrder[idx] = station._id
      })

      const newUserToSave = { ...user, likedStationsIds: newStationsOrder }
      updateUser(newUserToSave)
    } catch (err) {
      console.log(err)
    }

    // setPageStation((prevStation) => ({ ...prevStation, items }))
  }

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
  //   let updatedStations = [...stations]
  //   console.log(draggedItem)
  //   const dragged = updatedStations.splice(draggedItem, 1)[0] // remove the dragged item

  //   updatedStations.splice(index, 0, dragged) // insert it

  //   const newStationsOrder = []
  //   updatedStations.map((station, idx) => {
  //     newStationsOrder[idx] = station._id
  //   })

  //   const newUserToSave = { ...user, likedStationsIds: newStationsOrder }

  //   setFiltered(updatedStations)
  //   setDraggedItem(null)
  //   try {
  //     updateUser(newUserToSave)
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  const [isGemini, setIsGemini] = useState(false)

  function onSetGeminiModal(ev) {
    if (isGemini) {
      setIsGemini(false)
    } else {
      setIsGemini(true)
      // console.log(ev)
      setPosition({ x: ev.pageX, y: ev.pageY })
    }
  }

  const modalRef = useRef()

  const [isDrag, setIsDrag] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const requestRef = useRef(null)

  function onMouseDown(ev) {
    const rect = modalRef.current.getBoundingClientRect()

    // Calculate the offset from where the mouse is clicked within the modal
    offsetRef.current = {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
    }

    setIsDrag(true)
  }

  function onDragModal(ev) {
    // const rect = ev.target.getBoundingClientRect()
    const x = ev.clientX - offsetRef.current.x
    const y = ev.clientY - offsetRef.current.y
    setPosition({ x, y })

    requestRef.current = requestAnimationFrame(() => {
      setPosition({ x, y })
    })
  }

  function onMouseUp() {
    setIsDrag(false)
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
  }

  useEffect(() => {
    if (isDrag) {
      document.addEventListener('mousemove', onDragModal)
      document.addEventListener('mouseup', onMouseUp)
    } else {
      document.removeEventListener('mousemove', onDragModal)
      document.removeEventListener('mouseup', onMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', onDragModal)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDrag])

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
        <div className='action-buttons-container'>
          <button>
            <LuSparkles
              className='ai-icon'
              onClick={(event) => {
                onSetGeminiModal(event)
                // navigate('/generate')
              }}
            />
          </button>
          <button>
            <FaPlus className='plus-icon' onClick={onCreateNewStation} />
          </button>
          {
            // isGemini && (
            //   <div className='gemini-modal-container'>
            //     {!geminiLoader ? (
            //       <span>Generate by prompt</span>
            //     ) : (
            //       <span>Generating...</span>
            //     )}
            //     <div className='user-interface'>
            //       <input type='text' onChange={handlePromptChange} />
            //       <button ref={geminiRef} onClick={handleUserPrompt}>
            //         {geminiLoader ? '' : 'Generate'}
            //       </button>
            //       {/* {!geminiLoader ? (
            //       ) : (
            //         <button className='loading-button'></button>
            //       )} */}
            //     </div>
            //   </div>
            // )
            isGemini && (
              <div
                className='gemini-container'
                onMouseDown={(event) => {
                  onMouseDown(event)
                }}
                // onMouseUp={() => onMouseUp()}
                // onMouseLeave={() => setIsDrag(false)}
                // onMouseMove={(event) => isDrag && onDragModal(event)}
              >
                <GeminiChat
                  isGemini={isGemini}
                  setIsGemini={setIsGemini}
                  position={position}
                  isDrag={isDrag}
                  modalRef={modalRef}
                />
              </div>
            )
          }
        </div>
      </div>
      <Sort setFiltered={setFiltered} isNav={true} />
      <div className='playlist-input-container'>
        <IoSearch
          className='icon search'
          onClick={() => {
            inputRef.current.focus()
          }}
        />

        <input
          type='text'
          name='txt'
          id=''
          ref={inputRef}
          placeholder='Search in your library'
          // value={filterByToSet.txt}
          onChange={handleChange}
        />
        {filterByToSet.txt && (
          <IoCloseOutline
            className='icon clear'
            onClick={() => {
              inputRef.current.value = ''
              setFilterByToSet({ ...filterByToSet, txt: '' })
            }}
          />
        )}
      </div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='stations'>
          {(provided) => (
            <div
              className='library-stations-container'
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {filtered.map((station, idx) => {
                return (
                  <Draggable
                    draggableId={station._id}
                    key={station._id}
                    index={idx}
                  >
                    {(provided, snapshot) => (
                      <div
                        className={
                          snapshot.isDragging
                            ? 'station-container dragged'
                            : 'station-container'
                        }
                        // key={station._id}
                        onClick={() => {
                          if (isHover.current) return
                          navigate(`station/${station._id}`)
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
                          {(isPlaying && currStation._id === station._id && (
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
                                  if (station.items.length === 0) return
                                  if (currStation._id === station._id) {
                                    setIsPlaying(true)
                                    return
                                  }
                                  onSelectStation(station._id)
                                }}
                              />
                            </div>
                          )}
                          <img src={station.cover} alt='' />
                        </div>
                        <div className='info-container'>
                          <b
                            className={
                              currStation._id === station._id
                                ? `station-name playing`
                                : 'station-name'
                            }
                          >
                            {station.title}
                          </b>
                          <div className='playlist-details'>
                            <span>Playlist</span>
                            {(station.items.length && (
                              <span>
                                {station.items.length}{' '}
                                {station.stationType === 'podcast'
                                  ? 'podcasts'
                                  : 'songs'}
                              </span>
                            )) || <span>0 songs</span>}
                          </div>
                        </div>
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
    </div>
  )
}
