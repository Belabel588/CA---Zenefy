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

export function ArtistDetails({}) {
  const artist = useSelector((storeState) => storeState.artistModule.currArtist)
  return (
    <div className='artist-details-container'>
      <span>{artist.name}</span>
    </div>
  )
}
