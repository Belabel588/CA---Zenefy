import { FaPlus } from "react-icons/fa6";
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { stationService } from "../services/stations.service";
import { loadStations } from "../store/actions/station.actions";


export function AppLibrary() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const mainData = useSelector((storeState) => storeState.stationModule.stations)

  useEffect(() => {
    loadStations(filterBy)
  }, [filterBy])
  
  console.log(mainData);


  return (
    <div className="library-container">

      <p className="library-text">Your Library</p>
      <button>
        <FaPlus className="plus-icon" />
      </button>
    </div>
  )
}