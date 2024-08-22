import { FaPlus } from 'react-icons/fa6'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { stationService } from '../services/stations.service'
import { loadStations } from '../store/actions/station.actions'

export function AppLibrary() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const mainData = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  useEffect(() => {
    loadStations(filterBy)
  }, [filterBy])

  console.log(mainData)

  return (
    <div className='library-container'>
      <div className='library-header'>
        <div className='library-title'>
          <svg
            className='library-icon'
            xmlns='http://www.w3.org/2000/svg'
            role='img'
            height='24'
            width='24'
            aria-hidden='true'
            viewBox='0 0 24 24'
            data-encore-id='icon'
            class='Svg-sc-ytk21e-0 haNxPq'
          >
            <path
              className='icon'
              d='M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z'
              fill='#b3b3af'
            ></path>
          </svg>
          <p className='library-text'>Your Library</p>
        </div>

        <button>
          <FaPlus className='plus-icon' />
        </button>
      </div>

      <div className='library-stations'>
        <button>
          <img
            className='liked-songs-station'
            src='src/assets/styles/imgs/liked-songs.png'
            alt='liked songs playlist'
          />
        </button>
      </div>
    </div>
  )
}
