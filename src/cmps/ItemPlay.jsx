import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { FastAverageColor } from 'fast-average-color'

import { stationService } from '../services/station.service.js'

import {
  loadStations,
  removeStation,
  setCurrStation,
  setIsPlaying,
  setCurrItem,
  setCurrColor,
  setPlaylist,
  setCurrItemIdx,
  setIsItem,
  saveStation,
} from '../store/actions/station.actions.js'

import { updateUser } from '../store/actions/user.actions.js'

import { EditOptions } from './EditOptions.jsx'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

import { FiEdit2 } from 'react-icons/fi'
import { CiCircleMinus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'

export function ItemPlay() {
  const navigate = useNavigate()
  const currItem = useSelector(
    (stateSelector) => stateSelector.stationModule.currItem
  )
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const stations = useSelector(
    (stateSelector) => stateSelector.stationModule.stations
  )
  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  const [likedItems, setLikedItems] = useState([])

  useEffect(() => {
    setLikedStation()
  }, [currItem, stations])

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

  function onCloseItem() {
    setIsItem(false)
  }

  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const handleRightClick = (event) => {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY })

    setIsVisible(true)
  }

  const handleClickOutside = () => {
    setIsVisible(false)
  }

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
          text: 'Add Playlist',
          icon: <PlusIcon />,
          onClick: () => {
            onAddStation(station)
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
      const saved = await saveStation(likedStation)

      const userToSave = { ...user, likedSongsIds }
      await updateUser(userToSave)
      setLikedStation()
    } catch (err) {
      console.log(err)
    }
  }

  function openSongOptions(event, item) {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY })

    setIsVisible(true)
  }
  const [addToPlaylist, setAddToPlaylist] = useState(false)
  const [create, setCreate] = useState(false)
  const [removeFromPlaylist, setRemoveFromPlaylist] = useState(false)

  return (
    <div className='item-play-container'>
      <div className='header-container'>
        <span>{currItem.album}</span>
        <div className='buttons-container'>
          <button
            onClick={() => {
              setItemToEdit(currItem)
              optionsState.current = 'song'
              openSongOptions(event, currItem)
            }}
          >
            <HiOutlineDotsHorizontal />
          </button>
          <button onClick={onCloseItem}>
            <IoClose />
          </button>
        </div>{' '}
      </div>
      <img src={currItem.cover} alt='' />
      <div className='title-container'>
        <div className='item-name-container'>
          <b>{currItem.name}</b>
          <span>{currItem.artist}</span>
        </div>

        <div className='buttons-container'>
          <button
            onClick={(event) => {
              if (likedItems.includes(currItem.id)) {
                setItemToEdit(currItem)
                optionsState.current = 'song'
                openSongOptions(event, currItem)
              } else {
                likeSong(currItem)
              }
            }}
            className='like-button'
          >
            {(likedItems.includes(currItem.id) && (
              <AddedIcon className={'added'} />
            )) || <PlusIcon className={'to-add'} />}
          </button>
        </div>
      </div>
      <EditOptions
        setLikedStation={setLikedStation}
        options={options}
        station={currStation}
        // toggleModal={toggleModal}
        // editRef={editRef}
        position={position}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        // onDeleteStation={onDeleteStation}
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
        // setStation={setStation}
      />
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
