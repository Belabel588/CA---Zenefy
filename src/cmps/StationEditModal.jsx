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

export function StationEditModal({
  station,
  modalRef,
  toggleModal,
  saveStation,
}) {
  const [editStation, setEditStation] = useState({})
  const [coverSrc, setCoverSrc] = useState(station.cover)

  useEffect(() => {
    if (coverSrc) {
      setEditStation({ ...editStation, cover: coverSrc })
    } else {
      setEditStation({ ...station })
    }
  }, [station, coverSrc])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value
    console.log(field)
    console.log(value)

    switch (target.name) {
      case 'cover':
        console.log(target.src)

        break
      default:
        break
    }

    setEditStation({ ...editStation, [field]: value })
  }

  async function uploadFile(ev) {
    console.log('works')
    const res = await uploadService.uploadImg(ev)
    console.log(res.url)
    const coverSrc = res.url
    setCoverSrc(coverSrc)
  }

  function onSaveStation() {
    saveStation(editStation)
    toggleModal()
  }

  return (
    <div className='modal-container' ref={modalRef}>
      <div className='head-container'>
        <b>Edit details</b>
        <IoMdClose className='close-button' onClick={toggleModal} />
      </div>

      <div className='info-container'>
        <div className='img-container'>
          <img src={editStation.cover} alt='' name='cover' />
          <input type='file' id='cover' onChange={uploadFile} />
          <label htmlFor='cover' className='file-label'></label>
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
