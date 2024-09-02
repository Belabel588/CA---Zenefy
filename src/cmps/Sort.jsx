import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'

import { utilService } from '../services/util.service.js'
import { loadStations } from '../store/actions/station.actions.js'

export function Sort() {
  const [checkedLabel, setCheckedLabel] = useState('all')
  let filterByToEdit = useSelector((storeState) => storeState.stationModule.filterBy)
  const dispatch = useDispatch()



  useEffect(() => {

    loadStations()

  }, [filterByToEdit])

  function onSetCheckedLabel({ target }) {
    console.log(target.id)
    // if (target.id === checkedLabel) { whats the purpose here?
    //   setCheckedLabel('all')
    //   return
    // }
    setCheckedLabel(target.id)
    filterByToEdit = { ...filterByToEdit, stationType: target.id }
    dispatch({ type: SET_FILTER_BY, filterBy: filterByToEdit })
    // console.log(filterByToEdit);
  }

  const labels = [{ name: 'all' }, { name: 'music' }, { name: 'podcast' }]

  return (
    <div className='filter-container'>
      {labels.map((label) => {
        return (
          <div className='label-container' key={label.name}>
            <input
              type='checkbox'
              id={label.name}
              onChange={onSetCheckedLabel}
              checked={checkedLabel === label.name ? true : false}
            />
            <label className='sort-label' htmlFor={label.name}>
              {utilService.capitalizeFirstLetter(label.name)}
            </label>
          </div>
        )
      })}
    </div>
  )
}
