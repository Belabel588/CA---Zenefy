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
} from '../store/actions/station.actions.js'
import { updateUser } from '../store/actions/user.actions.js'
import { apiService } from '../services/youtube-spotify.service.js'

import { EditOptions } from '../cmps/EditOptions.jsx'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { FaPlus } from 'react-icons/fa'

import { SET_IS_LOADING } from '../store/reducers/user.reducer.js'

export function SearchIndex() {
  const [defaultFilterBy, setFilterBy] = useState(
    stationService.getDefaultFilter()
  )
  const [allTags, setAllTags] = useState([]) // State to store the tags
  const [searchResults, setSearchResults] = useState({
    items: [{}, {}, {}, {}],
  }) // State to store the search results
  const [refactoredResults, setRefactoredResults] = useState([]) // State to store refactored results
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
  const [userStations, setUserStations] = useState([])

  const [likedItems, setLikedItems] = useState([])

  const isHover = useRef(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch({ type: SET_FILTER_BY, filterBy: defaultFilterBy })
    loadStations()
  }, [])

  useEffect(() => {
    if (stations.length > 0) {
      const tags = getAllTags(stations)
      setAllTags(tags)
    }
  }, [stations])

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const results = await apiService.getVideos(filterBy.txt)

        setSearchResults(results) // Save the results in the state
      } catch (error) {
        console.error('Failed to fetch search results:', error)
      }
    }

    if (filterBy.txt) {
      fetchSearchResults()
    }
  }, [filterBy])

  // Call handleSearchResults when searchResults changes
  useEffect(() => {
    if (searchResults.length > 0) {
      handleSearchResults(searchResults)
      ////// HERE
    }
  }, [searchResults])

  useEffect(() => {
    setLikedStation()

    const userStationsToSet = stations.filter((station) =>
      user.likedStationsIds.includes(station._id)
    )
    setUserStations(userStationsToSet)
    console.log(userStations)
  }, [searchedStation])

  async function handleSearchResults(searchResults) {
    try {
      const refactored = await stationService.createStationFromSearch(
        searchResults,
        filterBy.txt
      )

      setRefactoredResults(refactored) // Store the refactored results in the state

      const savedStation = await stationService.save(refactored)

      setSearchedStation(savedStation)
      dispatch({ type: SET_IS_LOADING, isLoading: false })
    } catch (error) {
      console.error('Error refactoring search results:', error)
      setLoading(false) // Stop loading in case of an error
    }
  }

  function getAllTags(stations) {
    return stations.map((station) => station.tags).flat() // Flatten the array of arrays into a single array
  }

  const generateColor = (index, total) => {
    const hue = (index / total) * 360 // Spread hues evenly across the color wheel
    return `hsl(${hue}, 70%, 50%)` // HSL color with 70% saturation and 50% lightness
  }

  async function onPlaySearchedSong(songIdx) {
    const stationId = searchedStation._id
    // console.log(searchedStation)

    await setCurrStation(stationId)
    await setCurrItem(songIdx, searchedStation)
    await setIsPlaying(true)
  }

  async function setLikedStation() {
    const like = await stations.find(
      (station) => station._id === 'likedSongs123'
    )
    console.log(like)
    const items = like.items
    const itemsId = items.map((item) => {
      return item.id
    })
    setLikedItems(itemsId)
  }

  async function likeSong(itemToAdd) {
    if (itemToAdd.url === '') return
    if (!user) return

    const likedStation = stations.find((station) => station.isLiked)
    likedStation.items.push(itemToAdd)
    try {
      await saveStation(likedStation)
      const likedSongsIds = user.likedSongsIds
      likedSongsIds.push(itemToAdd.id)
      const userToSave = { ...user, likedSongsIds }
      await updateUser(userToSave)
      setLikedStation()
    } catch (err) {
      console.log(err)
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
    console.log(`Adding ${selectedSong} to playlist ${playlistId}`)
    handleCloseModal()
  }

  const options = [
    {
      text: 'Add to playlist',
      icon: <FaPlus />,
      onClick: () => {
        onCreateNewStation()
      },
    },
  ]

  const [itemToAdd, setItemToAdd] = useState({})

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
  function handleClick(event, itemToAdd) {
    event.preventDefault()
    setPosition({ x: event.pageX - 100, y: event.pageY })

    setIsVisible(true)

    setItemToAdd(itemToAdd)
  }

  function handleClickOutside() {
    // event.preventDefault()
    setIsVisible(false)
  }

  function toggleModal() {
    if (modalRef.current.style.display !== 'flex') {
      modalRef.current.style.display = 'flex'
    } else {
      modalRef.current.style.display = 'none'
    }
  }

  return filterBy.txt === '' ? (
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
                  backgroundColor: generateColor(index, stations.length),
                }}
              >
                {uniqueStation.stationType}
              </li>
            </Link>
          ))}
        {allTags.map((tag, idx) => (
          <Link to='#' key={idx}>
            <li
              className='tag'
              style={{ backgroundColor: generateColor(idx, allTags.length) }}
            >
              {tag}
            </li>
          </Link>
        ))}
      </ul>
    </section>
  ) : loading ? (
    <LoadingAnimation /> // Show loading animation if loading is true
  ) : (
    <>
      <div className='search-results' onClick={handleClickOutside}>
        <section className='info'>
          <h1>Top result</h1>
          <img src={searchResults[0]?.cover} alt={searchResults[0]?.artist} />
          <h2>{searchResults[0]?.artist}</h2>
          <h6>Artist</h6>
        </section>
        <section className='songs'>
          <h1>Songs</h1>
          {searchedStation.items.slice(0, 4).map((item, idx) => (
            <div
              key={item.id}
              className='song-item'
              onDoubleClick={() => onPlaySearchedSong(item.id)}
              // style={{ position: 'relative' }}
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
              <span className='time'>3:33</span>
              <button onClick={() => likeSong(item)}>
                {(likedItems.includes(item.id) && <AddedIcon />) || (
                  <PlusIcon />
                )}
              </button>
              <HiOutlineDotsHorizontal
                className='options-button'
                onContextMenu={() => handleClick(event, item)}
              />
            </div>
          ))}
        </section>
      </div>
      <EditOptions
        options={options}
        editRef={editRef}
        position={position}
        isVisible={isVisible}
        stations={stations}
        itemToAdd={itemToAdd}
        userStations={userStations}
        handleClickOutside={handleClickOutside}
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
