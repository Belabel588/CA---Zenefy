import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { utilService } from '../services/util.service.js'

export function Sort() {
  const [checkedLabel, setCheckedLabel] = useState()

  function onSetCheckedLabel({ target }) {
    console.log(target.id)
    if (target.id === checkedLabel) {
      setCheckedLabel('all')
      return
    }
    setCheckedLabel(target.id)
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
