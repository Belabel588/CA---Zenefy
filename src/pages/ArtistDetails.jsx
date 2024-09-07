import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'

import { StationEditModal } from '../cmps/StationEditModal.jsx'
import { EditOptions } from '../cmps/EditOptions.jsx'
import { PlayingAnimation } from '../cmps/PlayingAnimation.jsx'

import {
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
  saveStation,
  removeStation,
  setCurrItemIdx,
  loadStations,
  setIsLoading,
} from '../store/actions/station.actions.js'

import { updateUser } from '../store/actions/user.actions.js'

import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

import { FiEdit2 } from 'react-icons/fi'
import { CiCircleMinus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'

export function ArtistDetails({}) {
  const params = useParams()
  const { artistId } = params
  const artist = useSelector((storeState) => storeState.artistModule.currArtist)
  console.log(artist)

  const isPlaying = useSelector(
    (storeSelector) => storeSelector.stationModule.isPlaying
  )

  useEffect(() => {
    console.log(artistId)
  }, [artistId])
  return (
    <div className='artist-details-container'>
      <header className='artist-header'>
        <img
          className='artist-cover'
          src={
            (artist.images.length > 0 && artist.images[0].url) ||
            'https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021'
          }
        />

        <div className='title-container'>
          <span>{artist.type}</span>
          <b className='artist-title'>{artist.name}</b>

          <span className='artist-followers'>
            {artist.followers.total.toLocaleString('he')} Followers
          </span>
        </div>
      </header>
      <div className='buttons-container'>
        <div className='play-container'>
          <div className='play-button-container'>
            {(isPlaying && currStation._id === station._id && (
              <BiPause
                className='pause-button'
                onClick={() => setIsPlaying(false)}
              />
            )) || (
              <BiPlay
                className='play-button'
                onClick={() => {
                  if (station.items.length === 0) return
                  if (currStation._id === station._id) {
                    setIsPlaying(true)
                    return
                  }
                  onSelectStation(station._id)
                }}
              />
            )}
          </div>
          {/* <RxPlusCircled className='option-button plus-button' /> */}
          <BsThreeDots
            className='option-button more-button'
            onClick={(event) => {
              optionsState.current = 'station'
              handleRightClick(event)
            }}
          />
        </div>
        <div className='list-container'>
          <span>List</span>
          <IoListSharp />
        </div>
      </div>
    </div>
  )
}
