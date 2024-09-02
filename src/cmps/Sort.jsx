import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { utilService } from '../services/util.service.js';
import { StationList } from './StationList.jsx'; // Import the StationList component

export function Sort() {
  const [checkedLabel, setCheckedLabel] = useState('all');
  const [filteredStations, setFilteredStations] = useState([]); // State for the filtered list of stations
  
  // Get the stations from the global store
  const stations = useSelector((storeState) => storeState.stationModule.stations);

  useEffect(() => {
    // Set the initial filtered stations list based on the stations in the store
    setFilteredStations(stations);
  }, [stations]);

  useEffect(() => {
    

    // Filter stations based on the selected label
    const filteredStations = filterStations(checkedLabel);

    

    // Set the filtered stations list in the local state
    setFilteredStations(filteredStations);
  }, [checkedLabel]);

  function filterStations(label) {
    

    if (label === 'all') {
      
      return stations; // Use the original stations from the store
    }

    const filtered = stations.filter(station => station.stationType === label);

    

    return filtered;
  }

  function onSetCheckedLabel({ target }) {
    
    setCheckedLabel(target.id);
  }

  const labels = [{ name: 'all' }, { name: 'music' }, { name: 'podcast' }];

  return (
    <div className='filter-container'>
      {labels.map((label) => (
        <div className='label-container' key={label.name}>
          <input
            type='checkbox'
            id={label.name}
            onChange={onSetCheckedLabel}
            checked={checkedLabel === label.name}
          />
          <label className='sort-label' htmlFor={label.name}>
            {utilService.capitalizeFirstLetter(label.name)}
          </label>
        </div>
      ))}

      {/* Render the StationList with filtered stations */}
      <StationList stations={filteredStations} />
    </div>
  );
}
