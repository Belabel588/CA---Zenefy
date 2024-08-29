import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'
import { stationService } from '../services/station.service.js'
import {
  loadStations,
  removeStation,
} from '../store/actions/station.actions.js'

export function SearchIndex() {
  const [defaultFilterBy, setFilterBy] = useState(
    stationService.getDefaultFilter()
  )
  const [allTags, setAllTags] = useState([]) // State to store the tags
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

  function getAllTags(stations) {
    return stations.map((station) => station.tags).flat() // Flatten the array of arrays into a single array
  }

  const generateColor = (index, total) => {
    const hue = (index / total) * 360 // Spread hues evenly across the color wheel
    return `hsl(${hue}, 70%, 50%)` // HSL color with 70% saturation and 50% lightness
  }

  async function onRemoveSong(songId) {
    try {
      await removeStation(songId)
      showSuccessMsg('Song removed')
    } catch (err) {
      showErrorMsg('Cannot remove song')
    }
  }

  async function onAddSong() {
    const song = stationService.getEmptySong()
    song.name = prompt('Name?')
    try {
      const savedSong = await addSong(song)
      showSuccessMsg(`Song added (id: ${savedSong._id})`)
    } catch (err) {
      showErrorMsg('Cannot add song')
    }
  }

  async function onUpdateSong(song) {
    try {
      const savedSong = await updateSong(song)
      showSuccessMsg(`Song updated`)
    } catch (err) {
      showErrorMsg('Cannot update song')
    }
  }

  async function getApiData() {
    const res = await apiService.getVideos('nirvana')
    console.log(res)
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
  ) : (
    <h1>STATION</h1>
  )
}
