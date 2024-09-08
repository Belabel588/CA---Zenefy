import { stationService } from '../services/station.service'
import { loadStations } from '../store/actions/station.actions'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { SET_FILTER_BY } from '../store/reducers/station.reducer'
import { StationList } from './StationList'
import { SuggestedStations } from './SuggestedStations'
import { apiService } from '../services/youtube-spotify.service'
import { setIsLoading } from '../store/actions/station.actions'

export function SearchDynamicCmp() {
  const { category } = useParams()
  const dispatch = useDispatch()
  const location = useLocation()
  const [searchResults, setSearchResults] = useState([])
  const [artists, setArtists] = useState([])
  const [refactoredResults, setRefactoredResults] = useState([])

  const isLoading = useSelector((storeState) => storeState.stationModule.isLoading)
  const stations = useSelector((storeState) => storeState.stationModule.stations)

  useEffect(() => {
    async function getData() {
      try {
        const data = await stationService.getStationData(params.stationId)
        setStationDataObj(data)

        if (data.stationsWithSameType && data.stationsWithSameType.length > 0) {
          const stationType = data.stationsWithSameType[0].stationType
          dispatch({
            type: SET_FILTER_BY,
            filterBy: { ...filterBy, stationType },
          })
        }

        // console.log('Fetched data:', data)
      } catch (err) {
        console.error('Failed to fetch data', err)
        setError('Failed to fetch data')
      }
    }

    getData()
  }, [params.stationId, dispatch])

  useEffect(() => {
    if (filterBy) {
      // console.log('FILTERBY INSIDE OF DYNM CMP BEFORE LOAD STATIONS', filterBy)
      loadStations()
    }
  }, [filterBy, dispatch])

  if (error) return <h1>{error}</h1>

  // console.log('STATIONS TO RENDER ARE::', stations)

  return (
    <div className='main-search-container'>
      <section className='header-section' style={{ backgroundColor }}>
        <h1>{category}</h1>
      </section>
      {!isLoading && <h1 className='discover'>Discover new music</h1>}
      <SuggestedStations stations={refactoredResults} color={backgroundColor} />
      {!isLoading && <h1 className='from-editors'>From the Editors</h1>}
    </div>
  )
}
