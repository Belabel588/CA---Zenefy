import React, { useState } from 'react'
import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { loadStations, saveStation } from '../store/actions/station.actions.js'
import { stationService } from '../services/station.service.js'
import { showSuccessMsg } from '../services/event-bus.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { setIsLoading } from '../store/actions/station.actions.js'

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
  handleClickOutside,
  addToPlaylist,
  setAddToPlaylist,
  setIsVisible,
}) {
  let id = 0

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )
  const isLoading = useSelector(
    (stateSelector) => stateSelector.stationModule.isLoading
  )

  // const userStations = stations.filter((station) =>
  //   user.likedStationsIds.includes(station._id)
  // )
  // console.log(userStations)

  async function onAddToStation(stationId) {
    try {
      setIsLoading(true)
      handleClickOutside()
      const station = await stationService.getById(stationId)
      station.items.push(itemToAdd)
      await saveStation(station)
      // await loadStations()

      showSuccessMsg('Song added')
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isVisible && (
        <div
          className='edit-options-container add-to-playlist'
          style={{
            top: `${position.y}px`,
            left: `calc( ${position.x - 15}px)`,
            position: 'absolute',
          }}
          onMouseLeave={() => {
            setAddToPlaylist(false)
            setIsVisible(false)
          }}
          onMouseEnter={() => {
            setIsVisible(true)
          }}
        >
          {options.map((option) => (
            <div
              className='option-container'
              key={++id}
              onClick={option.onClick}
              onMouseEnter={() => {
                console.log(addToPlaylist)
                if (option.text === 'Add to playlist') setAddToPlaylist(true)
              }}
            >
              {option.icon}
              <span>{option.text}</span>
            </div>
          ))}
          {addToPlaylist && (
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
          )}
        </div>
      )}
    </>
  )
}
