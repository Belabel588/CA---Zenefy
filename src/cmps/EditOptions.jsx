import React, { useState } from 'react'
import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { saveStation } from '../store/actions/station.actions.js'
import { stationService } from '../services/station.service.js'
import { showSuccessMsg } from '../services/event-bus.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

import { FiEdit2 } from 'react-icons/fi'
import { CiCircleMinus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'

export function EditOptions({
  options,
  station,
  toggleModal,

  position,
  isVisible,
  onDeleteStation,
  onCreateNewStation,
  stations,
  itemToAdd,
  userStations,
}) {
  let id = 0

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )
  // const userStations = stations.filter((station) =>
  //   user.likedStationsIds.includes(station._id)
  // )
  // console.log(userStations)

  async function onAddToStation(stationId) {
    console.log(stationId)
    console.log(itemToAdd)
    try {
      const station = await stationService.getById(stationId)
      station.items.push(itemToAdd)
      await saveStation(station)
      showSuccessMsg('Song added')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      {isVisible && (
        <div
          className='edit-options-container add-to-playlist'
          style={{
            top: `${position.y}px`,
            left: `calc( ${position.x}px)`,
            position: 'absolute',
          }}
        >
          {options.map((option) => (
            <div
              className='option-container'
              key={++id}
              onClick={option.onClick}
            >
              {option.icon}
              <span>{option.text}</span>
            </div>
          ))}
          <div className='add-to-stations-container'>
            {userStations.map((station) => {
              return (
                <div
                  className='station-container'
                  key={station._id}
                  onClick={() => onAddToStation(station._id)}
                  style={
                    {
                      // top: `${position.y}px`,
                      // left: `calc( ${position.x}px)`,
                      // position: 'absolute',
                    }
                  }
                >
                  <span>{station.title}</span>
                  <img src={station.cover} alt='' />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
