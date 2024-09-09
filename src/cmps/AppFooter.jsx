import { useSelector, useDispatch } from 'react-redux'

import React, { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'

import { stationService } from '../services/station.service.js'
import { utilService } from '../services/util.service.js'

import {
  setCurrStation,
  setCurrItem,
  setIsPlaying,
  setCurrItemIdx,
  setCurrColor,
  saveStation,
  setIsLoading,
  loadStations,
} from '../store/actions/station.actions.js'
import { showSuccessMsg } from '../services/event-bus.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

import { updateUser } from '../store/actions/user.actions.js'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { BiSkipNext } from 'react-icons/bi'
import { BiSkipPrevious } from 'react-icons/bi'
import { BiRepeat } from 'react-icons/bi'
import { TiArrowShuffle } from 'react-icons/ti'

export function AppFooter() {
  const [currentTime, setCurrentTime] = useState(0)

  const [volume, setVolume] = useState(50)
  const latestVolume = useRef(volume)

  const playerRef = useRef()

  const [duration, setDuration] = useState(1)

  const timeToSet = useRef()

  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )
  const currItem = useSelector(
    (stateSelector) => stateSelector.stationModule.currItem
  )

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const currIdx = useSelector(
    (stateSelector) => stateSelector.stationModule.currItemIdx
  )

  const stations = useSelector(
    (stateSelector) => stateSelector.stationModule.stations
  )

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )
  const currColor = useSelector(
    (stateSelector) => stateSelector.stationModule.currColor
  )

  const [station, setStation] = useState([])

  const [urlToPlay, setUrlToPlay] = useState()

  const [currTimeMinutes, setCurrTimeMinutes] = useState()
  const [currTimeSeconds, setCurrTimeSeconds] = useState()

  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  const [likedItems, setLikedItems] = useState([])
  const [likedStation, likedStationToSet] = useState({})

  useEffect(() => {
    // setStation(currStation)

    if (currStation) {
      setCurrItem(currStation.items[currIdx].id, currStation)

      if (currStation.items[currIdx].url) {
        setUrlToPlay(currStation.items[currIdx].url)
      }
    }
    setCurrentTime(0)

    setCurrColor(currStation.cover)
    setLikedStation()

    setTimeout(() => {
      const durationToSet = playerRef.current.getDuration()
      setDuration(durationToSet)
    }, 1000)
  }, [currStation, currIdx])

  useEffect(() => {
    setLikedStation()
  }, [stations])

  useEffect(() => {
    playerRef.current.seekTo(0)
  }, [currItem])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime((prevTime) =>
        prevTime < duration ? prevTime + 1 : prevTime
      )
    }, 1000) // Simulate progress every second

    return () => clearInterval(interval)
  }, [duration, isPlaying, currentTime])

  async function setLikedStation(savedStation) {
    let like

    if (!savedStation) {
      like = stations.find(
        (station) => station.isLiked && station.createdBy._id === user._id
      )
    } else {
      like = savedStation
    }

    likedStationToSet(like)

    const likedItems = like.items

    const itemsId = likedItems.map((item) => {
      return item.id
    })

    setLikedItems([...itemsId])
  }

  function next() {
    let idxToSet
    if (isRepeat) {
      setCurrStation(currStation._id)
      setCurrItem(currItem.id, currStation)
      setCurrItemIdx(currIdx)
      setCurrentTime(0)
      playerRef.current.seekTo(0)

      return
    }
    if (isShuffle) {
      idxToSet = utilService.getRandomIntInclusive(
        0,
        currStation.items.length - 1,
        [currIdx]
      )
      setCurrItemIdx(idxToSet)
      return
    }

    if (currIdx + 1 === currStation.items.length) {
      setCurrItemIdx(0)
    } else {
      idxToSet = currIdx + 1
      setCurrItemIdx(idxToSet)
    }
  }

  function prev() {
    let idxToSet
    if (currIdx - 1 < 0) {
      idxToSet = currStation.items.length - 1
      setCurrItemIdx(idxToSet)
    } else {
      idxToSet = currIdx - 1
      setCurrItemIdx(idxToSet)
    }
  }

  const controlButtons = [
    {
      type: 'shuffle',
      // icon: <TiArrowShuffle />,
      icon: <Shuffle />,
      isActive: isShuffle,
      onClick: () => {
        setIsRepeat(false)
        setIsShuffle((prev) => (prev = !prev))
      },
    },
    {
      type: 'back',
      // icon: <BiSkipPrevious />,
      icon: <PrevButton />,
      onClick: () => {
        prev()
      },
    },
    {
      type: 'play',
      icon: <BiPlay />,
      onClick: () => {
        if (currentTime === duration) setCurrentTime(0)
        setIsPlaying(true)
        const durationToSet = playerRef.current.getDuration()

        setDuration(durationToSet)
      },
    },
    {
      type: 'pause',
      icon: <BiPause />,
      onClick: () => {
        setIsPlaying(false)
      },
    },
    {
      type: 'next',
      icon: <NextButton />,
      // icon: <BiSkipNext />,
      onClick: () => {
        next()
      },
    },
    {
      type: 'repeat',
      icon: <Repeat />,
      // icon: <BiRepeat />,
      isActive: isRepeat,
      onClick: () => {
        setIsShuffle(false)
        setIsRepeat((prev) => (prev = !prev))
      },
    },
  ]
  const buttonsContainer = [
    {
      type: 'nowPlaying',
      icon: <i className='fa-solid fa-play'></i>,
    },
    {
      type: 'queue',
      icon: <i className='fa-solid fa-bars'></i>,
    },

    {
      type: 'volumeHigh',
      icon: <VolumeHigh />,
      onClick: () => {
        setVolume(0)
      },
    },
    {
      type: 'volumeLow',
      icon: <VolumeLow />,
      onClick: () => {
        setVolume(0)
      },
    },
    {
      type: 'volumeMute',
      icon: <VolumeMute />,
      onClick: () => {
        setVolume(latestVolume.current)
      },
    },
  ]

  async function likeSong(itemToAdd) {
    if (itemToAdd.url === '') return
    if (!user) return

    const likedStation = stations.find(
      (station) => station.isLiked && station.createdBy._id === user._id
    )
    likedStation.items.push(itemToAdd)

    try {
      const saved = await saveStation(likedStation)

      const likedSongsIds = user.likedSongsIds
      likedSongsIds.push(itemToAdd.id)
      const userToSave = { ...user, likedSongsIds }
      await updateUser(userToSave)
      setLikedStation()
    } catch (err) {
      console.log(err)
    }
  }

  async function onRemoveItem(stationId) {
    try {
      setIsLoading(true)
      // handleClickOutside()
      // setIsVisible(false)
      const station = await stationService.getById(stationId)
      const idxToRemove = station.items.findIndex(
        (item) => item.id === currItem.id
      )
      station.items.splice(idxToRemove, 1)
      const savedStation = await saveStation(station)
      await loadStations()
      setLikedStation(savedStation)
      showSuccessMsg('Song removed')
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  )
  const playBarRef = useRef()

  useEffect(() => {
    async function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }
    async function changeColor() {
      const hex = await setCurrColor(currItem.cover)
      playBarRef.current.style.backgroundColor = hex
    }
    if (windowDimensions.width < 770) {
      changeColor()
    } else {
      playBarRef.current.style.backgroundColor = 'black'
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      // getAllStations()
    }
  }, [windowDimensions, currItem])

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    // console.log(width)
    return {
      width,
      height,
    }
  }

  return (
    <footer className='app-footer play-bar-container' ref={playBarRef}>
      <div className='song-details-container'>
        <img src={currItem.cover} className='play-bar-cover' alt='' />
        <div className='song-text-container'>
          <Link to={`item/${currItem.id}`} className='song-name'>
            {currItem.name}
          </Link>
          <span className='song-artist'>{currItem.artist}</span>
        </div>
        <button
          onClick={async () => {
            if (likedItems.includes(currItem.id)) {
              onRemoveItem(likedStation._id)
            } else {
              await likeSong(currItem)
            }
          }}
        >
          {(likedItems.includes(currItem.id) && <AddedIcon />) || <PlusIcon />}
        </button>
        <div
          className='mobile-play-button'
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false)
              return
            }
            if (currentTime === duration) setCurrentTime(0)
            setIsPlaying(true)
            const durationToSet = playerRef.current.getDuration()

            setDuration(durationToSet)
          }}
        >
          {(isPlaying && (
            // <button>
            <BiPause />
            // </button>
          )) || (
            // <button>
            <BiPlay />
            // </button>
          )}
        </div>
      </div>

      <div className='control-container'>
        <div className='buttons-container'>
          {controlButtons.map((button) => {
            if (button.type === 'play' && isPlaying) return
            if (button.type === 'pause' && !isPlaying) return
            return (
              <button
                key={button.type}
                onClick={button.onClick}
                className={
                  button.isActive
                    ? `button ${button.type}-button active`
                    : `button ${button.type}-button`
                }
              >
                {button.icon}
              </button>
            )
          })}
        </div>
        <div className='time-container'>
          <span>{utilService.formatSongTime(currentTime)}</span>

          <ProgressBar
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            duration={duration}
            playerRef={playerRef}
            currTimeMinutes={currTimeMinutes}
            currTimeSeconds={currTimeSeconds}
            setCurrTimeMinutes={setCurrTimeMinutes}
            setCurrTimeSeconds={setCurrTimeSeconds}
            timeToSet={timeToSet}
          />

          <ReactPlayer
            url={urlToPlay}
            style={{ display: 'none' }}
            playing={isPlaying}
            ref={playerRef}
            volume={volume / 100}
            onEnded={() => {
              next()
            }}
          />
          <span>{utilService.formatSongTime(Math.ceil(duration))}</span>
        </div>
      </div>

      <div className='buttons-volume-container'>
        {buttonsContainer.map((button) => {
          if (button.type === 'volumeMute' && volume !== 0) return
          if (button.type === 'volumeHigh' && volume < 50) return
          if (button.type === 'volumeLow' && volume >= 50) return
          if (button.type === 'volumeLow' && volume === 0) return
          return (
            <button key={button.type} onClick={button.onClick}>
              {button.icon}
            </button>
          )
        })}

        <VolumeBar
          volume={volume}
          setVolume={setVolume}
          latestVolume={latestVolume}
        />
        <button>
          <ExpendIcon />
        </button>
      </div>
    </footer>
  )
}

const ProgressBar = ({
  currentTime,
  duration,
  setCurrentTime,
  playerRef,
  currTimeMinutes,
  currTimeSeconds,
  setCurrTimeMinutes,
  setCurrTimeSeconds,
  timeToSet,
}) => {
  let progressPercentage = (currentTime / duration) * 100

  const timeRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const progressColor = isHovered ? '#1DB954' : '#FFFFFF'
    const trackColor = isHovered ? '#535353' : '#535353'

    timeRef.current.style.background = `linear-gradient(to right, ${progressColor} ${progressPercentage}%, ${trackColor} ${progressPercentage}%)`
  }, [progressPercentage, isHovered])

  function onSetTime({ target }) {
    timeToSet.current = +target.value
    progressPercentage = (timeToSet.current / duration) * 100
    setCurrentTime(timeToSet.current)
  }

  return (
    <div className='time-container'>
      <input
        type='range'
        onChange={onSetTime}
        onMouseUp={() => {
          playerRef.current.seekTo(timeToSet.current)
        }}
        value={currentTime}
        className='time-progress'
        ref={timeRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        step={1}
        max={duration}
      />
    </div>
  )
}

const VolumeBar = ({ volume, setVolume, latestVolume }) => {
  const volumeRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const progressColor = isHovered ? '#1DB954' : '#FFFFFF'
    const trackColor = isHovered ? '#535353' : '#535353'

    volumeRef.current.style.background = `linear-gradient(to right, ${progressColor} ${volume}%, ${trackColor} ${volume}%)`
  }, [volume, isHovered])

  function onSetVolume(ev) {
    const target = ev.target
    const volumeToSet = +target.value

    latestVolume.current = volumeToSet
    setVolume(volumeToSet)
  }

  return (
    <div className='volume-container'>
      <input
        type='range'
        onChange={(event) => {
          onSetVolume(event)
        }}
        value={volume}
        className='volume-progress'
        ref={volumeRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
      className='svg-icon'
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
function Shuffle() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z'></path>
      <path d='m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z'></path>
    </svg>
  )
}

function PrevButton() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z'></path>
    </svg>
  )
}

function NextButton() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z'></path>
    </svg>
  )
}
function Repeat() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z'></path>{' '}
    </svg>
  )
}
function VolumeHigh() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z'></path>
      <path d='M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z'></path>
    </svg>
  )
}
function VolumeLow() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 6.087a4.502 4.502 0 0 0 0-8.474v1.65a2.999 2.999 0 0 1 0 5.175v1.649z'></path>
    </svg>
  )
}
function VolumeMute() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z'></path>
      <path d='M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z'></path>
    </svg>
  )
}
function ExpendIcon() {
  return (
    <svg
      role='img'
      aria-hidden='true'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      className='svg-icon'
    >
      <path d='M6.53 9.47a.75.75 0 0 1 0 1.06l-2.72 2.72h1.018a.75.75 0 0 1 0 1.5H1.25v-3.579a.75.75 0 0 1 1.5 0v1.018l2.72-2.72a.75.75 0 0 1 1.06 0zm2.94-2.94a.75.75 0 0 1 0-1.06l2.72-2.72h-1.018a.75.75 0 1 1 0-1.5h3.578v3.579a.75.75 0 0 1-1.5 0V3.81l-2.72 2.72a.75.75 0 0 1-1.06 0z'></path>
    </svg>
  )
}
