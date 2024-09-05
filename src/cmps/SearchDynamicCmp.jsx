import { stationService } from '../services/station.service'
import { loadStations } from '../store/actions/station.actions'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom' // Import useLocation
import { SET_FILTER_BY } from '../store/reducers/station.reducer'
import { StationList } from './StationList'
import { SuggestedStations } from './SuggestedStations'

export function SearchDynamicCmp() {
  const { category } = useParams()
  const dispatch = useDispatch()
  const location = useLocation() // Using useLocation to access passed state

  const filterBy = useSelector(
    (storeState) => storeState.stationModule.filterBy
  )
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
console.log(stations);

  console.log(location.state.backgroundColor);


  // Access the backgroundColor passed via state
  const backgroundColor = location.state.backgroundColor || '#ffffff' // Default to white if no color is passed

  useEffect(() => {
    console.log('Background color received:', backgroundColor)
    // You can use the backgroundColor here if needed
  }, [backgroundColor])

  return (
    <div className='main-search-container' > {/* Applying the color */}
      <section className='header-section' style={{ backgroundColor }}><h1 >{category}</h1></section>
      <SuggestedStations stations={stations} color={backgroundColor}/>
      {/* <StationList style={{ backgroundColor }} /> */}
    </div>
  )
}
