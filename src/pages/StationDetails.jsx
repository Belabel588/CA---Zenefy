import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'

import {
  setCurrStation,
  setIsPlaying,
} from '../store/actions/station.actions.js'

import { LuClock3 } from 'react-icons/lu'
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { utilService } from '../services/util.service.js'

export function StationDetails() {
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )

  const { stationId } = useParams()

  // const song = useSelector((storeState) => storeState.songModule.song)
  const [station, setStation] = useState({ items: [] })

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const isHover = useRef(false)

  useEffect(() => {
    // loadSong(songId)
    loadStation(stationId)
  }, [stationId])

  async function loadStation(stationId) {
    const stationToSet = await stationService.getById(stationId)

    setStation(stationToSet)
  }

  async function onPlaySong(songId) {
    const song = await stationService.getItem(songId)
  }

  return (
    <section className='station-details-container'>
      <header className='station-header'>
        <img className='station-cover' src={station.cover} />

        <div className='title-container'>
          <span>Playlist</span>
          <b className='station-title'>{station.title}</b>
          <p className='playlist-summery'>Playlist summery here</p>
          <span className='playlist-artist'>Playlist artist here</span>
        </div>
      </header>
      <div className='user-interface-container'>
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
                    setIsPlaying(true)
                    setCurrStation(station._id)
                  }}
                />
              )}
            </div>
            <RxPlusCircled className='option-button plus-button' />
            <BsThreeDots className='option-button more-button' />
          </div>
          <div className='list-container'>
            <span>List</span>
            <IoListSharp />
          </div>
        </div>
        <div className='items-container'>
          <div className='info-container'>
            <div className='title-container'>
              <span>#</span>
              <span>Title</span>
            </div>
            <span>Album</span>
            <span className='date-added span'>Date Added</span>
            <LuClock3 className='time' />
          </div>
          {station.items.map((item) => {
            return (
              <div
                className='song-container'
                key={item.id}
                onDoubleClick={() => onPlaySong(item.id)}
                onMouseEnter={() => {
                  console.log(isHover)
                  isHover.current = true
                }}
                onMouseLeave={() => {
                  isHover.current = false
                }}
              >
                <div key={item.id} className='song-title-container'>
                  <div className='idx-play-container'>
                    <div className='item-idx-container'>
                      <span className='item-idx'>1</span>
                    </div>
                    <div className='play-pause-container'>
                      {true ? (
                        <BiPause className='pause-button' />
                      ) : (
                        <BiPlay className='play-button' />
                      )}
                    </div>
                  </div>
                  <img src={item.cover} alt='' />
                  <div className='name-artist-container'>
                    <Link to={`/item/${item.id}`}>
                      {' '}
                      <span className='song-name'>{item.name}</span>
                    </Link>
                    <span>{item.artist}</span>
                  </div>
                </div>
                <span>{item.album}</span>
                <span>{station.addedAt}</span>
                <span className='time' key={utilService.makeId()}>
                  {'3:33'}
                </span>
              </div>
            )
          })}
        </div>{' '}
      </div>
    </section>
  )
}
