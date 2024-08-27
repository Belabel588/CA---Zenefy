import { useSelector, useDispatch } from 'react-redux'

import React, { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'

import { stationService } from '../services/station.service.js'
import { utilService } from '../services/util.service.js'

import {
  setCurrStation,
  setCurrItem,
  setIsPlaying,
  setCurrItemIdx,
  setCurrColor,
} from '../store/actions/station.actions.js'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { BiSkipNext } from 'react-icons/bi'
import { BiSkipPrevious } from 'react-icons/bi'
import { BiRepeat } from 'react-icons/bi'
import { TiArrowShuffle } from 'react-icons/ti'

import sample from '../../public/Pokémon Theme.mp3'

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

  const [station, setStation] = useState([])

  const [urlToPlay, setUrlToPlay] = useState()

  const [currTimeMinutes, setCurrTimeMinutes] = useState()
  const [currTimeSeconds, setCurrTimeSeconds] = useState()

  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  useEffect(() => {
    // setStation(currStation)

    if (currStation) {
      setCurrItem(currStation.items[currIdx].id, currStation)
      console.log(currItem)
      if (currStation.items[currIdx].url) {
        setUrlToPlay(currStation.items[currIdx].url)
      }
    }
    setCurrentTime(0)
    setCurrColor(currStation.cover)

    setTimeout(() => {
      const durationToSet = playerRef.current.getDuration()
      setDuration(durationToSet)
    }, 1000)
  }, [currStation, currIdx])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime((prevTime) =>
        prevTime < duration ? prevTime + 1 : prevTime
      )
    }, 1000) // Simulate progress every second

    return () => clearInterval(interval)
  }, [duration, isPlaying, currentTime])

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
      icon: <TiArrowShuffle />,
      isActive: isShuffle,
      onClick: () => {
        setIsRepeat(false)
        setIsShuffle((prev) => (prev = !prev))
      },
    },
    {
      type: 'back',
      icon: <BiSkipPrevious />,
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
      icon: <BiSkipNext />,
      onClick: () => {
        next()
      },
    },
    {
      type: 'repeat',
      icon: <BiRepeat />,
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
      type: 'connect',
      icon: <i className='fa-solid fa-computer'></i>,
    },
    {
      type: 'volumeHigh',
      icon: <i className='fa-solid fa-volume-high'></i>,
      onClick: () => {
        setVolume(0)
      },
    },
    {
      type: 'volumeLow',
      icon: <i className='fa-solid fa-volume-low'></i>,
      onClick: () => {
        setVolume(0)
      },
    },
    {
      type: 'volumeMute',
      icon: <i className='fa-solid fa-volume-xmark'></i>,
      onClick: () => {
        setVolume(latestVolume.current)
      },
    },
  ]

  return (
    <footer className='app-footer play-bar-container'>
      <div className='song-details-container'>
        <img src={currItem.cover} className='play-bar-cover' alt='' />
        <div className='song-text-container'>
          <b className='song-name'>{currItem.name}</b>
          <span className='song-artist'>{currItem.artist}</span>
        </div>
        <button>
          <i className='fa-solid fa-circle-plus'></i>
        </button>
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
          <i className='fa-solid fa-up-right-and-down-left-from-center'></i>
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
