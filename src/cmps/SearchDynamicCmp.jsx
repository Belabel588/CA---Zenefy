import { stationService } from '../services/station.service'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { SuggestedStations } from './SuggestedStations'
import { apiService } from '../services/youtube-spotify.service'
import { setIsLoading } from '../store/actions/station.actions'

export function SearchDynamicCmp() {
  const { category } = useParams() // Get category from URL params
  const dispatch = useDispatch()
  const location = useLocation()
  const [searchResults, setSearchResults] = useState([])

  const isLoading = useSelector((storeState) => storeState.stationModule.isLoading)
  const stations = useSelector((storeState) => storeState.stationModule.stations)

  const backgroundColor = location.state?.backgroundColor || '#ffffff'

  // Load playlists by category and handle results
  async function loadCategoryPlaylists(category) {
    try {
      const playlists = await apiService.getPlaylistsByCategory(category)
      console.log('Playlists for category:', category, playlists)
      setSearchResults(playlists)
    } catch (error) {
      console.error('Error fetching playlists for category:', error)
    }
  }

  useEffect(() => {
    console.log('LOADING CATEGORY', category)
    loadCategoryPlaylists(category)
  }, [category])

  console.log('Search Results:', searchResults)

  return (
    <div className='main-search-container'>
      <section className='header-section' style={{ backgroundColor }}>
        <h1>{category}</h1>
      </section>
      {!isLoading && <h1 className='discover'>Discover new music</h1>}
      <SuggestedStations stations={searchResults} color={backgroundColor} />
      {!isLoading && <h1 className='from-editors'>From the Editors</h1>}
    </div>
  )
}
