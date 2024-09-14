import { stationService } from '../services/station.service'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { SuggestedStations } from './SuggestedStations'
import { apiService } from '../services/youtube-spotify.service'
import { setIsLoading } from '../store/actions/station.actions'
import { LoadingAnimation } from '../cmps/LoadingAnimation'

export function SearchDynamicCmp() {
  const { category } = useParams() // Get category from URL params
  const dispatch = useDispatch()
  const location = useLocation()
  const [searchResults, setSearchResults] = useState([])
  const [categoryNotFoundErr, setCategoryNotFoundErr] = useState('')

  const isLoading = useSelector((storeState) => storeState.stationModule.isLoading)
  const stations = useSelector((storeState) => storeState.stationModule.stations)

  console.log('STATIONS IN DYNCAINDEX ARE', stations);

  const backgroundColor = location.state?.backgroundColor || '#ffffff'

  // Load playlists by category and handle results
  async function loadCategoryPlaylists(category) {
    if (category === 'Music' || category === 'Podcasts') {
      console.log('OH NO ITS', category);

      setIsLoading(false)

      return
    }
    try {
      const playlists = await apiService.getPlaylistsByCategory(category)
      console.log('Playlists for category:', category, playlists)
      setSearchResults(playlists)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching playlists for category:', error)
      setCategoryNotFoundErr('Availble in premium purchase')
    }
  }

  useEffect(() => {
    console.log('LOADING CATEGORY', category)
    setIsLoading(true)
    loadCategoryPlaylists(category)
  }, [])

  console.log('Search Results:', searchResults)
  console.log(categoryNotFoundErr);

  return (
    <div className='main-search-container' >
      <section className='header-section' style={{ backgroundColor }}>
        <h1>{category}</h1>

      </section>
      {!isLoading && (
        <div className='discover-new-music ' style={{ backgroundColor }}>
          {!isLoading && <h1 >
            {categoryNotFoundErr ? categoryNotFoundErr : 'Discover new music'}
          </h1>}
          <SuggestedStations stations={searchResults} color={backgroundColor} />
        </div>
      )}
      {!isLoading && (
        <div className="playlists-you-might-like" >
          <h1>

          </h1>
        </div>
      )}

    </div>
  )


}
