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
    setIsLoading(true)
    const randomArtists = stationService.getRandomArtists(3)
    setArtists(randomArtists)
    
    const fetchSearchResults = async () => {
      try {
        const promises = randomArtists.map(artist => apiService.getVideos(artist, category))
        const results = await Promise.all(promises)
        setSearchResults(results)
      } catch (error) {
        console.error('Failed to fetch search results:', error)
      }
    }
    fetchSearchResults()
  }, [category])
  


  useEffect(() => {
    const processSearchResults = async () => {
      if (searchResults.length > 0) {
        let savedResults = []
        for (let idx = 0; idx < artists.length; idx++) {
          const artist = artists[idx]
          const artistResults = searchResults[idx]
          const savedStation = await handleSearchResults(artistResults, artist)
          savedResults.push(savedStation)
        }
        setRefactoredResults(savedResults)
        setIsLoading(false)
      }
    }
  
    processSearchResults()
  }, [searchResults])
  
  async function handleSearchResults(artistResults, artist) {
    try {
      const refactored = await stationService.createStationFromSearch(artistResults, artist)
      console.log('refactored', refactored)
  
      const savedStation = await stationService.save(refactored)
      console.log('savedStation', savedStation)
  
      return savedStation
    } catch (error) {
      console.error('Error refactoring search results:', error)
      return null
    }
  }
  

  const backgroundColor = location.state?.backgroundColor || '#ffffff'

  console.log('refactoredResults', refactoredResults)



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
