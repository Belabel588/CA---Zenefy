import { FaPlus } from "react-icons/fa6";
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { stationService } from "../services/stations.service";
import { loadStations } from "../store/actions/station.actions";


export function AppLibrary() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const mainData = useSelector((storeState) => storeState.stationModule.stations)
  const isLoading = useSelector((storeState) => storeState.stationModule.isLoading) // Get isLoading state

  useEffect(() => {
    loadStations(filterBy)
  }, [filterBy])

  if (isLoading) {
    return <div>Loading...</div> // Render a loading state while waiting for data
  }

  return (
    <div className="library-container">
      <p className="library-text">Your Library</p>
      <button>
        <FaPlus className="plus-icon" />
      </button>
    </div>
  )
}
