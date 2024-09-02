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
  create,
  setCreate,
  removeFromPlaylist,
  setRemoveFromPlaylist,
  optionsState,
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
  console.log(isVisible)

  function handleOptionHover(optionText) {
    if (optionText === 'Add to playlist') {
      setAddToPlaylist(true)
      setCreate(false)
      setRemoveFromPlaylist(false)
    } else if (optionText === 'Create') {
      setAddToPlaylist(false)
      setCreate(true)
      setRemoveFromPlaylist(false)
    } else if (optionText === 'Remove from playlist') {
      setAddToPlaylist(false)
      setCreate(false)
      setRemoveFromPlaylist(true)
    }
  }

  function handleParentLeave() {
    setIsVisible(false)
    setAddToPlaylist(false)
    setCreate(false)
    setRemoveFromPlaylist(false)
  }
  return (
    <>
      {isVisible && (
        <div
          className='edit-options-container add-to-playlist'
          style={{
            // left: '0px',
            left: `${position.x - 200}px`,
            top: `${position.y}px`,
            position: 'absolute',
            zIndex: '5',
            opacity: '1',
          }}
          onMouseLeave={() => {
            // setAddToPlaylist(false)
            // setIsVisible(false)
            handleParentLeave()
          }}
          onMouseEnter={() => {
            // setIsVisible(true)
          }}
        >
          {options.map((option) => (
            <div
              className='option-container'
              key={++id}
              onClick={option.onClick}
              onMouseEnter={() => {
                handleOptionHover(option.text)
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
