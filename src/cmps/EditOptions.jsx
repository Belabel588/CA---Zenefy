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
import { GiCircle } from 'react-icons/gi'
import { FaRegCircle } from 'react-icons/fa'

export function EditOptions({
  options,
  station,
  toggleModal,

  position,
  isVisible,
  onDeleteStation,
  onCreateNewStation,
  stations,
  itemToEdit,
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
  setStation,
}) {
  let id = 0

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )
  const isLoading = useSelector(
    (stateSelector) => stateSelector.stationModule.isLoading
  )

  async function onAddToStation(stationId) {
    try {
      setIsLoading(true)
      // handleClickOutside()
      // setIsVisible(false)
      const station = await stationService.getById(stationId)
      if (station.items.find((item) => item.id === itemToEdit.id)) return
      station.items.push(itemToEdit)
      const savedStation = await saveStation(station)
      console.log(savedStation)
      setStation({ ...savedStation })

      showSuccessMsg('Song added')
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
      setAddToPlaylist(false)
    }
  }
  async function onRemoveItem(stationId) {
    try {
      setIsLoading(true)
      // handleClickOutside()
      // setIsVisible(false)
      const station = await stationService.getById(stationId)
      const idxToRemove = station.items.findIndex(
        (item) => item.id === itemToEdit.id
      )
      station.items.splice(idxToRemove, 1)
      const savedStation = await saveStation(station)
      console.log(savedStation)
      setStation({ ...savedStation })

      showSuccessMsg('Song removed')
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

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
            <div className='song-edit-container add'>
              {userStations.map((station) => {
                return (
                  <div
                    className='station-container'
                    key={station._id}
                    onClick={() => {
                      setIsVisible(false)
                      onAddToStation(station._id)
                    }}
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
          {removeFromPlaylist && (
            <div className='song-edit-container remove'>
              {userStations.map((station) => {
                return (
                  <div
                    className='station-container'
                    key={station._id}
                    // onClick={() => {}}
                    onClick={() => {
                      if (
                        station.items.find((item) => item.id === itemToEdit.id)
                      ) {
                        onRemoveItem(station._id)
                      } else {
                        onAddToStation(station._id)
                      }
                    }}
                  >
                    <div className='info-container'>
                      <span>{station.title}</span>
                      <img src={station.cover} alt='' />
                    </div>
                    {(station.items.find(
                      (item) => item.id === itemToEdit.id
                    ) && <AddedIcon />) || <GiCircle />}
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

function PlusIcon() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon plus'
    >
      <path d='M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z'></path>
      <path d='M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H5a.75.75 0 0 1 0-1.5h2.25V5a.75.75 0 0 1 1.5 0v2.25H11a.75.75 0 0 1 .75.75z'></path>
    </svg>
  )
}
function AddedIcon() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon added'
    >
      <path d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z'></path>
    </svg>
  )
}
