import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'

import { StationList } from '../cmps/StationList.jsx'
import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
} from '../store/actions/station.actions.js'

import { IoMdClose } from 'react-icons/io'

export function StationEditModal({ station, modalRef, toggleModal }) {
  console.log(modalRef)
  console.log(station)
  return (
    <div className='modal-container' ref={modalRef}>
      <div className='head-container'>
        <b>Edit details</b>
        <IoMdClose className='close-button' onClick={toggleModal} />
      </div>

      <div className='info-container'>
        <img src={station.cover} alt='' />
        <div className='text-inputs-container'>
          <div className='input-name-container'>
            <input type='text' value={station.title} />
          </div>
          <div className='input-name-container'>
            <textarea name='' id='' cols='30' rows='10'></textarea>
          </div>
        </div>
        <button>Save</button>
      </div>
    </div>
  )
}
