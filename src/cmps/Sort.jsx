import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { utilService } from '../services/util.service.js'
import { StationList } from './StationList.jsx' // Import the StationList component
import { loadStations } from '../store/actions/station.actions.js'

export function Sort({ filtered, setFiltered, isNav }) {
  const [checkedLabel, setCheckedLabel] = useState('all')
  const [filteredStations, setFilteredStations] = useState([]) // State for the filtered list of stations

  // Get the stations from the global store
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  useEffect(() => {
    // Set the initial filtered stations list based on the stations in the store
    setFilteredStations(stations)
    setFiltered(stations)
  }, [stations])

  useEffect(() => {
    // Filter stations based on the selected label

    const filteredStations = filterStations(checkedLabel)
    console.log(filteredStations)
    // Set the filtered stations list in the local state
    // setFilteredStations(filteredStations)
    setFiltered(filteredStations)
    // console.log(filtered)
  }, [checkedLabel])

  function filterStations(label) {
    if (label === 'all') {
      loadStations()
      return stations // Use the original stations from the store
    }

    const filtered = stations.filter((station) => station.stationType === label)

    return filtered
  }

  function onSetCheckedLabel({ target }) {
    console.log(target.id.slice(0, target.id.length - 4))
    setCheckedLabel(target.id.slice(0, target.id.length - 4))
  }

  const labels = [{ name: 'all' }, { name: 'music' }, { name: 'podcast' }]

  return (
    <div className='filter-container'>
      {labels.map((label) => (
        <div className='label-container' key={utilService.makeId()}>
          <input
            type='checkbox'
            id={isNav ? `${label.name} nav` : `${label.name} hom`}
            onChange={onSetCheckedLabel}
            checked={checkedLabel === label.name}
          />
          <label
            className='sort-label'
            htmlFor={isNav ? `${label.name} nav` : `${label.name} hom`}
          >
            {utilService.capitalizeFirstLetter(label.name)}
          </label>
        </div>
      ))}

      {/* Render the StationList with filtered stations */}
      {/* <StationList stations={filteredStations} /> */}
    </div>
  )
}
