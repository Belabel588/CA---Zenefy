import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { userService } from '../services/user.service.js'
import { uploadService } from '../services/upload.service.js'

import { StationList } from '../cmps/StationList.jsx'
import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
} from '../store/actions/station.actions.js'
import { useEffectUpdate } from '../customHooks/useEffectUpdate.js'

import { IoMdClose } from 'react-icons/io'
import { FiEdit2 } from 'react-icons/fi'

export function StationEditModal({
  station,
  modalRef,
  toggleModal,
  saveStation,
}) {
  const [editStation, setEditStation] = useState({})
  const [coverSrc, setCoverSrc] = useState()

  useEffect(() => {
    setEditStation({ ...station })
  }, [station, coverSrc])

  useEffect(() => {
    if (coverSrc !== station.cover && coverSrc) {
      setEditStation({ ...editStation, cover: coverSrc })
    }
  }, [coverSrc])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.name) {
      case 'cover':
        break
      default:
        break
    }

    setEditStation({ ...editStation, [field]: value })
  }

  async function uploadFile(ev) {
    try {
      const res = await uploadService.uploadImg(ev)

      const coverSrc = res.url
      setCoverSrc(coverSrc)
    } catch (err) {
      console.log(err)
    }
  }

  function onSaveStation() {
    saveStation(editStation)
    toggleModal()
  }
  const fileRef = useRef()

  return (
    <div className='modal-container' ref={modalRef}>
      <div className='head-container'>
        <b>Edit details</b>
        <IoMdClose className='close-button' onClick={toggleModal} />
      </div>

      <div className='info-container'>
        <div className='img-container'>
          <div
            className='img-backshadow-container'
            onClick={() => fileRef.current.click()}
          >
            <div>
              <FiEdit2 />
              <span>Choose Photo</span>
            </div>
          </div>
          <img src={editStation.cover} alt='' name='cover' />
          <input
            type='file'
            id='cover'
            onChange={uploadFile}
            style={{ display: 'none' }}
            ref={fileRef}
          />
        </div>
        <div className='text-inputs-container'>
          <div className='input-name-container'>
            <input
              type='text'
              value={editStation.title}
              name='title'
              onChange={handleChange}
            />
          </div>
          <div className='input-name-container'>
            <textarea
              name='preview'
              id=''
              cols='30'
              rows='10'
              value={editStation.preview}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
        <button onClick={onSaveStation}>Save</button>
      </div>
    </div>
  )
}
