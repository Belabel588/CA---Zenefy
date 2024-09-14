import { stationService } from '../services/station.service'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { SuggestedStations } from './SuggestedStations'
import { apiService } from '../services/youtube-spotify.service'
import { setIsLoading } from '../store/actions/station.actions'
import { LoadingAnimation } from '../cmps/LoadingAnimation'

export function SearchDynamicCmp() {
  const { category } = useParams() // Get category from URL params
  const dispatch = useDispatch()
  const location = useLocation()
  const [searchResults, setSearchResults] = useState([])
  const [artistSearchResults, setArtistSearchResults] = useState([])
  const [categoryNotFoundErr, setCategoryNotFoundErr] = useState('')
  const [subCategories, setSubCategories] = useState([])

  const isLoading = useSelector((storeState) => storeState.stationModule.isLoading)
  const stations = useSelector((storeState) => storeState.stationModule.stations)

  console.log('STATIONS IN DYNCAINDEX ARE', stations);

  const backgroundColor = location.state?.backgroundColor || '#ffffff'

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

  // Load playlists by category and handle results
  async function loadCategoryPlaylists(category) {
    if (category === 'Music') {
      console.log('Category is Music');
      const subCategoriesList = stationService.getSubCategories('Music')
      console.log(subCategoriesList);

      setSubCategories(subCategoriesList)
      setIsLoading(false)

      return
    }
    if (category === 'Podcasts') {
      console.log('Category is Podcasts');
      const subCategoriesList = stationService.getSubCategories('Podcasts')
      console.log(subCategoriesList);

      setSubCategories(subCategoriesList)
      setIsLoading(false)

      return
    }

    try {
      setIsLoading(true)
      const playlists = await apiService.getPlaylistsByCategory(category)
      console.log('Playlists for category:', category, playlists)
      setSearchResults(playlists)
    } catch (error) {
      console.error('Error fetching playlists for category:', error)
      setCategoryNotFoundErr('Available in premium purchase')
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('LOADING CATEGORY', category)
    loadCategoryPlaylists(category)
  }, [])

  console.log('Search Results:', searchResults)
  console.log(categoryNotFoundErr);

  return (
    <div className='main-search-container'>
      <section className='header-section' style={{ backgroundColor }}>
        <h1>{category}</h1>
      </section>
      {subCategories.length > 0 && (
        <>
          <div className='music-podcast-playlist-container gradient' style={{ backgroundColor }}>
            <h1 >Discover new {category.toLowerCase()}</h1>
          </div>
          <div className='sub-categories-container' >
            <ul className='sub-categories-list'>
              {subCategories.map((subCategory, idx) => (
                <Link
                  to={{
                    pathname: `/genere/${subCategory.category}`,
                  }}
                  state={{ backgroundColor: generateColor(idx) }} // Use `state` here
                  key={idx}
                >
                  <li className='tag' style={{ backgroundColor: generateColor(idx) }}>
                    <img src={subCategory.image} />
                    {subCategory.category}
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </>
      )}
      {!isLoading && !subCategories.length && (
        <div className='discover-new-music' style={{ backgroundColor }}>
          <h1>
            {categoryNotFoundErr ? categoryNotFoundErr : 'Discover new music'}
          </h1>
          <SuggestedStations stations={searchResults} color={backgroundColor} />
        </div>
      )}
      {!isLoading && (
        <div className="playlists-you-might-like">
          <h1></h1>
        </div>
      )}
    </div>
  )
}
