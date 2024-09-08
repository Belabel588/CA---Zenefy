import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import { apiService } from '../services/youtube-spotify.service.js'
import { utilService } from '../services/util.service.js'

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

import { HiOutlineDotsHorizontal } from 'react-icons/hi'

import { FiEdit2 } from 'react-icons/fi'
import { CiCircleMinus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'

export function ArtistDetails({}) {
  const params = useParams()
  const { artistId } = params
  const artist = useSelector((storeState) => storeState.artistModule.currArtist)
  console.log(artist)
  const [station, setStation] = useState({ items: [] })

  const isPlaying = useSelector(
    (storeSelector) => storeSelector.stationModule.isPlaying
  )

  const currStation = useSelector(
    (storeSelector) => storeSelector.stationModule.currStation
  )
  const currItem = useSelector(
    (storeSelector) => storeSelector.stationModule.currItem
  )

  useEffect(() => {
    console.log(artistId)
    loadArtistStations()
  }, [artistId])

  async function loadArtistStations() {
    try {
      setIsLoading(true)
      const artistItems = await apiService.searchStations(artist.name)
      const station = await stationService.createStationFromSearch(artistItems)
      const savedStation = await stationService.save(station)
      setLikedStation()
      setStation(savedStation)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSelectStation(stationId) {
    await setCurrStation(stationId)
    await setCurrItem(0, currStation)
    setIsPlaying(true)
  }
  let counter = 0
  const [likedItems, setLikedItems] = useState([])
  async function setLikedStation() {
    // await loadStations()

    const like = stations.find(
      (station) => station.isLiked && station.createdBy._id === user._id
    )

    const items = like.items || []
    const itemsId = items.map((item) => {
      return item.id
    })
    setLikedItems(itemsId)
  }
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
      {station.items.map((item) => {
        return (
          <div
            className='song-container'
            key={item.id}
            onDoubleClick={() => {
              onPlaySong(item.id)
            }}
            onMouseEnter={() => {
              isHover.current = true
            }}
            onMouseLeave={() => {
              isHover.current = false
            }}
          >
            {/* <div className='song-title-container'> */}
            <div className='idx-play-container'>
              <div className='item-idx-container'>
                {currItem.id === item.id ? (
                  <PlayingAnimation />
                ) : (
                  <span
                    className={
                      counter === 0 || (counter + 1) % 10 === 0
                        ? 'item-idx custom-font'
                        : 'item-idx'
                    }
                  >
                    {++counter}
                  </span>
                )}
              </div>
              <div className='play-pause-container'>
                {currItem.id === item.id && isPlaying ? (
                  <BiPause
                    className='pause-button'
                    onClick={() => {
                      setIsPlaying(false)
                    }}
                  />
                ) : (
                  <BiPlay
                    className='play-button'
                    onClick={async () => {
                      if (JSON.stringify(currItem) !== JSON.stringify(item)) {
                        await setCurrStation(station._id)
                        await setCurrItem(item.id, station)
                      }

                      setIsPlaying(true)
                    }}
                  />
                )}
              </div>
            </div>
            <img src={item.cover} alt='' />
            <div className='name-artist-container'>
              <Link
                to={`/item/${item.id}`}
                className={
                  currItem.id === item.id ? `song-name playing` : 'song-name'
                }
              >
                {item.name}
              </Link>
              <span>{item.artist}</span>
              {/* </div> */}
            </div>
            <span className='album'>{item.album}</span>
            <span>{Date(item.addedAt).toLocaleString('he').slice(0, 13)}</span>
            <span className='time' key={utilService.makeId()}>
              {item.duration}
            </span>
            <button
              onClick={(event) => {
                if (likedItems.includes(item.id)) {
                  setItemToEdit(item)
                  optionsState.current = 'song'
                  openSongOptions(event, item)
                } else {
                  likeSong(item)
                }
              }}
              className='like-button'
            >
              {(likedItems.includes(item.id) && (
                <AddedIcon className={'added'} />
              )) || <PlusIcon className={'to-add'} />}
            </button>
            <HiOutlineDotsHorizontal
              className='dots'
              onClick={() => {
                setItemToEdit(item)
                optionsState.current = 'song'
                openSongOptions(event, item)
              }}
            />
          </div>
        )
      })}
    </div>
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
