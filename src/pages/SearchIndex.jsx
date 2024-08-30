import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { SET_FILTER_BY, } from '../store/reducers/station.reducer.js'
import { stationService } from '../services/station.service.js'
import {
  loadStations,
  removeStation,
  setCurrStation,
  setCurrItemIdx,
  setCurrItem,
  setIsPlaying,
} from '../store/actions/station.actions.js'
import { apiService } from '../services/youtube-spotify.service.js'


export function SearchIndex() {
  const [defaultFilterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const [allTags, setAllTags] = useState([]) // State to store the tags
  const [searchResults, setSearchResults] = useState([]) // State to store the search results
  const [refactoredResults, setRefactoredResults] = useState([]) // State to store refactored results
  const [searchedStation, setSearchedStation] = useState(stationService.getEmptyStation())


  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const filterBy = useSelector(
    (storeState) => storeState.stationModule.filterBy
  )

  const dispatch = useDispatch()

  useEffect(() => {
    console.log(defaultFilterBy)

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
        console.log(results)
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

  async function handleSearchResults(searchResults) {
    try {
      const refactored = await stationService.createStationFromSearch(searchResults);
      setRefactoredResults(refactored) // Store the refactored results in the state
      const savedStation = await stationService.save(refactored)
      setSearchedStation(savedStation)
      console.log('Refactored search results are:', refactored);
    } catch (error) {
      console.error('Error refactoring search results:', error);
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
    await setCurrStation(stationId)
    await setCurrItem(songIdx, searchedStation)
    await setIsPlaying(true)
  }

  // Log the refactored results before the return
  console.log('Refactored results to render:', refactoredResults);

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
  ) : (
    <>
      <div className='search-results'>
        <section className="info">
          <h1>Top result</h1>
          <img src={searchResults[0]?.cover} alt={searchResults[0]?.artist} />
          <h2>{searchResults[0]?.artist}</h2>
          <h6>Artist</h6>
        </section>
        <section className="songs">
          <h1>Songs</h1>
          {searchResults.slice(0, 4).map((result, idx) => (
            <div key={idx} className="song-item" onDoubleClick={() => onPlaySearchedSong(idx)}>
              <img src={result.cover} alt={result.name} className="song-cover" />
              <div className="song-details">
                <h2>{result.name}</h2>
                <h6>{result.artist}</h6>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
