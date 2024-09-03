import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'
import { stationService } from '../services/station.service.js'
import { LoadingAnimation } from '../cmps/LoadingAnimation.jsx'
import {
  loadStations,
  removeStation,
  setCurrStation,
  setCurrItemIdx,
  setCurrItem,
  setIsPlaying,
  saveStation,
  setIsLoading,
} from '../store/actions/station.actions.js'
import { updateUser } from '../store/actions/user.actions.js'
import { apiService } from '../services/youtube-spotify.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { showSuccessMsg } from '../services/event-bus.service.js'

import { EditOptions } from '../cmps/EditOptions.jsx'
import { PlayingAnimation } from '../cmps/PlayingAnimation.jsx'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { FaPlus } from 'react-icons/fa'

import { SET_IS_LOADING } from '../store/reducers/user.reducer.js'

export function SearchIndex() {
  const [defaultFilterBy, setFilterBy] = useState(
    stationService.getDefaultFilter()
  )
  const [searchResults, setSearchResults] = useState({
    items: [{}, {}, {}, {}],
  })
  const [refactoredResults, setRefactoredResults] = useState([])
  const [searchedStation, setSearchedStation] = useState({
    items: [{}, {}, {}, {}],
  })

  const loading = useSelector(
    (storeState) => storeState.stationModule.isLoading
  )

  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const filterBy = useSelector(
    (storeState) => storeState.stationModule.filterBy
  )

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )
  const currItem = useSelector(
    (stateSelector) => stateSelector.stationModule.currItem
  )
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  const currSearch = useSelector(
    (stateSelector) => stateSelector.stationModule.currSearch
  )
  const isActive = useSelector(
    (stateSelector) => stateSelector.stationModule.isActive
  )
  const [userStations, setUserStations] = useState([])

  const [likedItems, setLikedItems] = useState([])

  const isHover = useRef(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const categoriesWithImages = stationService.getCategoriesWithImages()
  // console.log('categoriesWithImages', categoriesWithImages)

  const tagColors = [
    '#006450',
    '#007cc0',
    '#005090',
    '#656565',
    '#7d4b32',
    '#817373',
    '#0d72ed',
    '#8c1932',
    '#8d67ab',
    '#a56752',
    '#af2896',
    '#b06239',
    '#ba5d07',
    '#bc5900',
    '#148a08',
    '#d84000',
    '#dc148c',
    '#e61e32',
    '#e8115b',
    '#e91429',
    '#1e3264',
    '#27856a',
    '#503750',
    '#5179a1',
    '#608108',
  ]

  const generateColor = (index) => {
    return tagColors[index % tagColors.length]
  }

  const tagElements = categoriesWithImages.map((category, idx) => (
    <Link to='#' key={idx}>
      <li className='tag' style={{ backgroundColor: generateColor(idx) }}>
        <img src={category.image} />
        {category.category}
      </li>
    </Link>
  ))

  useEffect(() => {
    dispatch({ type: SET_FILTER_BY, filterBy: defaultFilterBy })
    loadStations()
  }, [])

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        console.log(currSearch)
        const results = await apiService.getVideos(currSearch)
        setSearchResults(results)
      } catch (error) {
        console.error('Failed to fetch search results:', error)
      }
    }

    fetchSearchResults()
  }, [currSearch])

  useEffect(() => {
    if (searchResults.length > 0) {
      handleSearchResults(searchResults)
    }
  }, [searchResults])

  useEffect(() => {
    const userStationsToSet = stations.filter((station) =>
      user.likedStationsIds.includes(station._id)
    )
    setUserStations(userStationsToSet)
    const likedStation = userStationsToSet.find((station) => station.isLiked)
    setLikedStation(likedStation)
  }, [searchedStation])

  async function handleSearchResults(searchResults) {
    try {
      const refactored = await stationService.createStationFromSearch(
        searchResults,
        filterBy.txt
      )
      setRefactoredResults(refactored)
      const savedStation = await stationService.save(refactored)
      setSearchedStation(savedStation)
      dispatch({ type: SET_IS_LOADING, isLoading: false })
    } catch (error) {
      console.error('Error refactoring search results:', error)
    }
  }

  async function onPlaySearchedSong(songIdx) {
    const stationId = searchedStation._id
    await setCurrStation(stationId)
    await setCurrItem(songIdx, searchedStation)
    await setIsPlaying(true)
  }

  async function setLikedStation(likedStation) {
    const likedItems = likedStation?.items
    const itemsId = likedItems.map((item) => item.id)
    setLikedItems(itemsId)
  }

  async function likeSong(itemToEdit) {
    if (itemToEdit.url === '') return
    if (!user) return
    console.log(itemToEdit)
    try {
      setIsLoading(true)
      const likedStation = stations.find(
        (station) => station.isLiked && station.createdBy._id === user._id
      )
      console.log(likedStation)
      if (likedStation.items.find((item) => item.id === itemToEdit.id)) return

      likedStation.items.push(itemToEdit)

      const stationToSave = await saveStation(likedStation)

      const likedSongsIds = user.likedSongsIds
      likedSongsIds.push(itemToEdit.id)
      const userToSave = { ...user, likedSongsIds }
      await updateUser(userToSave)

      setLikedStation(stationToSave)
      const userStationsToSet = stations.filter((station) =>
        user.likedStationsIds.includes(station._id)
      )

      setUserStations([...userStationsToSet])
      showSuccessMsg('Song added')
    } catch (err) {
      console.log(err)
      showErrorMsg(`Couldn't like song`)
    } finally {
      setIsLoading(false)
    }
  }

  const [showModal, setShowModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)

  const playlists = user.likedSongsIds

  const handleAddSong = (song) => {
    setSelectedSong(song)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedSong(null)
  }

  const handleAddToPlaylist = (playlistId) => {
    handleCloseModal()
  }

  const [addToPlaylist, setAddToPlaylist] = useState(false)
  const options = [
    {
      text: 'Add to playlist',
      icon: <FaPlus />,
      onClick: () => { },
    },
  ]

  const [itemToEdit, setItemToEdit] = useState({})

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
  function handleClick(event, itemToEdit) {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY })

    setIsVisible(true)

    setItemToEdit(itemToEdit)
  }

  function handleClickOutside() {
    setIsVisible(false)
  }

  function toggleModal() {
    if (modalRef.current.style.display !== 'flex') {
      modalRef.current.style.display = 'flex'
    } else {
      modalRef.current.style.display = 'none'
    }
  }

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }
  

  return currSearch === '' ? (
    <section className='search-section'>
      <h1>Browse all</h1>
      <ul className='search-list'>
        {stations
          .filter(
            (station, index, currentStations) =>
              currentStations.findIndex(
                (currentStation) =>
                  currentStation.stationType === station.stationType
              ) === index
          )
          .map((uniqueStation, index) => (
            <Link
              to={`/genere/${uniqueStation._id}`}
              className='full-link'
              key={uniqueStation._id}
            >
              <li
                style={{
                  backgroundColor: generateColor(index),
                }}
              >
                <img src='../public/spotify-pics/music.png' alt='' />
                {uniqueStation.stationType}
              </li>
            </Link>
          ))}
        {tagElements}
      </ul>
    </section>
  ) : loading ? (
    <LoadingAnimation />
  ) : (
    <>
      <div className='search-results'>
        <section className='info'>
          <h1>Top result</h1>
          <div className='station-container'>
            <img src={searchResults[0]?.cover} alt={searchResults[0]?.artist} />
            <h2>{searchResults[0]?.artist}</h2>
            <h6>Artist</h6>
            {isPlaying && currStation._id === searchedStation._id ? (
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
                // style={{ position: 'absolute', bottom: '5px', opacity: '1' }}
                />
                <div className='animation-container'>
                  <PlayingAnimation />
                </div>
              </div>
            ) : (
              <div
                className='play-button-container'
                onClick={() => {
                  if (searchedStation.items.length === 0) return
                  if (currStation._id === searchedStation._id) {
                    setIsPlaying(true)
                    return
                  }
                  onSelectStation(searchedStation._id)
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
            )}{' '}
          </div>
        </section>
        <section className='songs'>
          <h1 key={'headerSongs'}>Songs</h1>
          <div className='results-container'>
            {searchedStation.items.slice(0, 4).map((item, idx) => (
              <div
                key={item.id}
                className='song-item'
                onDoubleClick={() => onPlaySearchedSong(item.id)}
              >
                <div className='img-container'>
                  {(isPlaying && currItem.id === item.id && (
                    <div
                      className='pause-button-container'
                      onMouseEnter={() => {
                        console.log(isHover.current)
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
                        <BiPlay
                          className='play-button'
                          onClick={() => {
                            if (currItem.id === item.id) {
                              setIsPlaying(true)
                              return
                            }
                            onSelectStation(searchedStation._id)

                            onPlaySearchedSong(item.id)
                          }}
                        />
                      </div>
                    )}
                  <img src={item.cover} alt='' />
                </div>
                <div className='song-details'>
                  <div className='name-container'>
                    <span
                      className={
                        currItem.id === item.id
                          ? 'item-name playing'
                          : 'item-name'
                      }
                      onClick={() => {
                        if (isHover.current) return
                        navigate(`/item/${item.id}`)
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className='artist-name'>{item.artist}</span>
                </div>
                <button onClick={() => likeSong(item)}>
                  {(likedItems.includes(item.id) && <AddedIcon />) || (
                    <PlusIcon />
                  )}
                </button>
                <span className='time'>{item.duration || '00:00'}</span>
                <HiOutlineDotsHorizontal
                  className='options-button'
                  onClick={() => handleClick(event, item)}
                />
              </div>
            ))}{' '}
          </div>
        </section>
      </div>
      <EditOptions
        options={options}
        editRef={editRef}
        position={position}
        isVisible={isVisible}
        stations={stations}
        itemToEdit={itemToEdit}
        userStations={userStations}
        handleClickOutside={handleClickOutside}
        addToPlaylist={addToPlaylist}
        setAddToPlaylist={setAddToPlaylist}
        setIsVisible={setIsVisible}
      // setCreate={setCreate}
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
