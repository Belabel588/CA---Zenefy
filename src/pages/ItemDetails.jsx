import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import {
  setCurrStation,
  setCurrItem,
  setIsPlaying,
  setIsLoading,
  setCurrColor,
  saveStation,
} from '../store/actions/station.actions.js'

import { updateUser } from '../store/actions/user.actions.js'

import { EditOptions } from '../cmps/EditOptions.jsx'

import { LuClock3 } from 'react-icons/lu'
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay, BiPause } from 'react-icons/bi'
import { FaPlus } from 'react-icons/fa6'
import { CiCircleMinus } from 'react-icons/ci'

export function ItemDetails() {
  const { itemId } = useParams()
  const [item, setItem] = useState({
    cover: '',
    name: '',
    artist: '',
    lyrics: '',
  })
  const isPlaying = useSelector((state) => state.stationModule.isPlaying)
  const isLoading = useSelector((state) => state.stationModule.isLoading)
  const currItem = useSelector((state) => state.stationModule.currItem)
  const currStation = useSelector((state) => state.stationModule.currStation)
  const currColor = useSelector((state) => state.stationModule.currColor)
  const headerRef = useRef()
  const gradientRef = useRef()

  const stations = useSelector(
    (stateSelector) => stateSelector.stationModule.stations
  )

  const [itemsStation, setItemsStation] = useState(
    stationService.getEmptyStation()
  )
  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  useEffect(() => {
    async function fetchItem() {
      try {
        setIsLoading(true)
        setLikedStation()
        const itemToSet = await stationService.getItem(itemId)
        const station = await stationService.getItemsStation(item.id)
        setItemsStation(station)
        setItem(itemToSet)
        // console.log(station)

        const color = await setCurrColor(itemToSet.cover)
        headerRef.current.style.backgroundColor = color
        gradientRef.current.style.backgroundColor = color
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [itemId, currColor])

  async function onCreateNewStation() {
    const emptyStation = stationService.getEmptyStation()
    emptyStation.items = []
    try {
      const newStation = await saveStation(emptyStation)
      navigate(`/station/${newStation._id}`)
    } catch (err) {
      console.log(err)
    }
  }

  const optionsState = useRef()
  let options
  const [itemToEdit, setItemToEdit] = useState({})

  optionsState.current === 'station'
    ? (options = [
        {
          text: 'Edit',
          icon: <FiEdit2 />,
          onClick: () => {
            setIsVisible(false)

            toggleModal()
          },
        },
        {
          text: 'Delete',
          icon: <CiCircleMinus />,
          onClick: () => {
            setIsVisible(false)

            onDeleteStation(station)
          },
        },
        {
          text: 'Create',
          icon: <FaPlus />,
          onClick: () => {
            setIsVisible(false)

            onCreateNewStation()
          },
        },
      ])
    : (options = [
        {
          text: 'Add to playlist',
          icon: <FaPlus />,
          onClick: () => {
            // onCreateNewStation()
            // if (!addToPlaylist) {
            //   setAddToPlaylist(true)
            // } else {
            //   setAddToPlaylist(false)
            // }
          },
          onClick: () => {},
        },
        {
          text: 'Create',
          icon: <FaPlus />,
          onClick: () => {
            setIsVisible(false)
            onCreateNewStation()
          },
        },
        {
          text: 'Remove from playlist',
          icon: <CiCircleMinus />,
          onClick: () => {
            // onCreateNewStation()
            // if (!addToPlaylist) {
            //   setAddToPlaylist(true)
            // } else {
            //   setAddToPlaylist(false)
            // }
          },
          onClick: () => {},
        },
      ])

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

  async function likeSong(itemToEdit) {
    if (itemToEdit.url === '') return
    if (!user) return

    const likedStation = stations.find(
      (station) => station.isLiked && station.createdBy._id === user._id
    )
    const likedSongsIds = user.likedSongsIds
    if (user.likedSongsIds.includes(itemToEdit.id)) {
      const idx = likedStation.items.findIndex(
        (item) => item.id === itemToEdit.id
      )
      likedStation.items.splice(idx, 1)
      const songIdx = likedSongsIds.findIndex((id) => id === itemToEdit.id)
      likedSongsIds.splice(songIdx, 1)
    } else {
      likedStation.items.push(itemToEdit)
      likedSongsIds.push(itemToEdit.id)
    }

    try {
      await saveStation(likedStation)
      const userToSave = { ...user, likedSongsIds }
      await updateUser(userToSave)
      setLikedStation()
    } catch (err) {
      console.log(err)
    }
  }

  function onSelectStation(stationId) {
    setCurrStation(stationId)
    setCurrItem(0, currStation)
    setIsPlaying(true)
  }

  function openSongOptions(event, item) {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY })

    setIsVisible(true)
  }
  const [likedItems, setLikedItems] = useState([])
  const [addToPlaylist, setAddToPlaylist] = useState(false)
  const [create, setCreate] = useState(false)
  const [removeFromPlaylist, setRemoveFromPlaylist] = useState(false)
  const editRef = useRef()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  async function onDeleteStation(stationToDelete) {
    if (stationToDelete.isLiked === true) return

    try {
      await removeStation(station._id)
      navigate('/')
    } catch (err) {
      console.log(err)
    }
  }
  const handleClickOutside = () => {
    setIsVisible(false)
  }

  // async function setLikedStation(likedStation) {
  //   const likedItems = likedStation?.items
  //   const itemsId = likedItems.map((item) => item.id)
  //   setLikedItems(itemsId)
  // }

  if (isLoading) return <div>Loading...</div>

  return (
    <section className='item-details-container'>
      <header className='item-header' ref={headerRef}>
        <img className='item-cover' src={item.cover} alt={item.name} />
        <div className='title-container'>
          <span>Song</span>
          <b className='item-title'>{item.name}</b>
          <span className='playlist-artist'>{item.artist}</span>
        </div>
      </header>
      <div className='user-interface-container'>
        <div ref={gradientRef} className='gradient'></div>
        <div className='buttons-container'>
          <div className='play-container'>
            <div className='play-button-container'>
              {currItem.id === item.id && isPlaying ? (
                <BiPause
                  className='pause-button'
                  onClick={() => setIsPlaying(false)}
                />
              ) : (
                <BiPlay
                  className='play-button'
                  onClick={async () => {
                    // const station = await stationService.getItemsStation(
                    //   item.id
                    // )
                    if (
                      JSON.stringify(currStation) !==
                      JSON.stringify(itemsStation)
                    ) {
                      await setCurrStation(itemsStation._id)
                      await setCurrItem(item.id, itemsStation)
                    }
                    setIsPlaying(true)
                  }}
                />
              )}
            </div>
            <div
              className='like-button-container'
              onClick={() => {
                if (likedItems.includes(item.id)) {
                  setItemToEdit(item)
                  optionsState.current = 'song'
                  openSongOptions(event, item)
                } else {
                  likeSong(item)
                }
              }}
            >
              {(likedItems.includes(item.id) && (
                <AddedIcon className={'option-button added-button'} />
              )) || <PlusIcon className='option-button plus-button' />}
            </div>
            <BsThreeDots
              className='option-button more-button'
              onClick={() => {
                setItemToEdit(item)
                optionsState.current = 'song'
                openSongOptions(event, item)
              }}
            />
          </div>
        </div>
        <div className='item-info-container'>
          <div className='lyrics-container'>
            <b>Lyrics</b>
            <p>{item.lyrics || `Lyrics not available`}</p>
          </div>
          <div className='artist-container'>
            <img src={item.cover} alt={item.artist} />
            <div className='title-container'>
              <b>Artist</b>
              <b>{item.artist}</b>
            </div>
          </div>
        </div>
      </div>
      <EditOptions
        options={options}
        station={itemsStation}
        editRef={editRef}
        position={position}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onDeleteStation={onDeleteStation}
        onCreateNewStation={onCreateNewStation}
        addToPlaylist={addToPlaylist}
        setAddToPlaylist={setAddToPlaylist}
        userStations={stations}
        create={create}
        setCreate={setCreate}
        removeFromPlaylist={removeFromPlaylist}
        setRemoveFromPlaylist={setRemoveFromPlaylist}
        optionsState={optionsState}
        handleClickOutside={handleClickOutside}
        itemToEdit={itemToEdit}
      />
    </section>
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
