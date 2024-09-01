import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

export function OptionsModal({
  songTitle,
  playlists,
  onClose,
  onAddToPlaylist,
}) {
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  const userPlaylists = stations.filter((station) =>
    playlists.includes(playlists)
  )
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <h2>Add "{songTitle}" to Playlist</h2>
        <ul className='playlists-list'>
          {userPlaylists.map((playlist) => (
            <li key={playlist.id} onClick={() => onAddToPlaylist(playlist.id)}>
              <img src={playlist.coverArt} alt={`${playlist.name} cover`} />
              <span>{playlist.name}</span>
            </li>
          ))}
        </ul>
        <button className='close-button' onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
