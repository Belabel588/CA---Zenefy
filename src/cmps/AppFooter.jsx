import { useSelector, useDispatch } from 'react-redux'

import { setCurrentlyPlayedStation } from '../store/actions/station.actions'

import React, { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'

import { stationService } from '../services/stations.service.js'
import { utilService } from '../services/util.service.js'
import { setIsPlaying } from '../store/actions/station.actions.js'

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
  const isPlayingNow = useRef()
  // const [isPlaying, setIsPlaying] = useState()

  const playerRef = useRef()

  const [duration, setDuration] = useState(1)

  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currentlyPlayedStation
  )

  const currSongUrl = useSelector(
    (stateSelector) => stateSelector.stationModule.currentSongURL
  )
  const nextSongUrl = useSelector(
    (stateSelector) => stateSelector.stationModule.nextSongURL
  )
  const prevSongUrl = useSelector(
    (stateSelector) => stateSelector.stationModule.prevSongURL
  )

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )
  console.log(isPlaying)

  const [station, setStation] = useState([])
  // const urlToPlay = useRef()
  const [urlToPlay, setUrlToPlay] = useState()

  const [currTimeMinutes, setCurrTimeMinutes] = useState()
  const [currTimeSeconds, setCurrTimeSeconds] = useState()

  const currIdx = useRef()
  const [currSong, setCurrSong] = useState({ songName: '', artist: '' })

  useEffect(() => {
    if (!currIdx.current) currIdx.current = 0
    // setIsPlaying(true)
    setStation(currStation)

    if (currStation) {
      console.log(currStation)
      setCurrSong(currStation.songs[currIdx.current])
      if (currStation.songs[currIdx.current].url) {
        setUrlToPlay(currStation.songs[currIdx.current].url)
      }
      console.log(currStation.songs[currIdx.current])
    }
    setCurrentTime(0)

    setTimeout(() => {
      const durationToSet = playerRef.current.getDuration()
      setDuration(durationToSet)
    }, 1000)
  }, [currStation, currIdx.current])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime((prevTime) =>
        prevTime < duration ? prevTime + 1 : prevTime
      )
    }, 1000) // Simulate progress every second

    return () => clearInterval(interval)
  }, [duration, isPlaying, currentTime])

  const controlButtons = [
    {
      type: 'shuffle',
      icon: <TiArrowShuffle />,
    },
    {
      type: 'back',
      icon: <BiSkipPrevious />,
      onClick: () => {
        if (currIdx.current - 1 < 0) {
          currIdx.current = currStation.songs.length - 1
        } else {
          currIdx.current--
        }
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
        console.log(currIdx.current)
        if (currIdx.current + 1 === currStation.songs.length) {
          currIdx.current = 0
        } else {
          currIdx.current++
        }
      },
    },
    {
      type: 'repeat',
      icon: <BiRepeat />,
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
        console.log(volume)
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
        <img src={station.imgUrl} className='play-bar-cover' alt='' />
        <div className='song-text-container'>
          <b className='song-name'>{currSong.songName}</b>
          <span className='song-artist'>{currSong.artist}</span>
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
                className={`button ${button.type}-button`}
              >
                {button.icon}
              </button>
            )
          })}
        </div>
        <div className='time-container'>
          {/* <span>{`${currTimeMinutes}:${currTimeSeconds}`}</span> */}
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
          />

          <ReactPlayer
            // url={'public/Pokémon Theme.mp3'}
            // url={currStation.currItem.url}
            url={urlToPlay}
            style={{ display: 'none' }}
            playing={isPlaying}
            ref={playerRef}
            volume={volume / 100}
          />
          <span>{utilService.formatSongTime(Math.ceil(duration))}</span>
          {/* <span>{`${Math.floor(duration / 60)}:${Math.ceil(
            (duration / 60 - Math.floor(duration / 60)) * 60
          )}`}</span> */}
        </div>
      </div>

      <div className='buttons-volume-container'>
        {/* <div className='buttons-container'> */}
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
        {/* </div> */}
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
    const timeToSet = +target.value
    progressPercentage = (timeToSet / duration) * 100
    // console.log(playerRef)
    playerRef.current.seekTo(timeToSet)

    setCurrentTime(timeToSet)
  }

  return (
    <div className='time-container'>
      <input
        type='range'
        onChange={onSetTime}
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
