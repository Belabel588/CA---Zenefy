import { useSelector } from 'react-redux'

import React, { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'

import sample from '../../public/Pokémon Theme.mp3'

export function AppFooter() {
  const [currentTime, setCurrentTime] = useState(0)
  // const duration = 330 // Example duration (in seconds)

  console.log(sample)
  const [volume, setVolume] = useState(50)
  const isPlayingNow = useRef()
  const [isPlaying, setIsPlaying] = useState()

  const playerRef = useRef()

  const [duration, setDuration] = useState()

  useEffect(
    () => {
      const durationToSet = playerRef.current.getDuration()
      console.log(durationToSet)
      setDuration(durationToSet)
    },
    [
      /**song */
    ]
  )

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime((prevTime) =>
        prevTime < duration ? prevTime + 1 : prevTime
      )
    }, 1000) // Simulate progress every second

    return () => clearInterval(interval)
  }, [duration, isPlaying])

  const controlButtons = [
    {
      type: 'shuffle',
      icon: <i className='fa-solid fa-shuffle'></i>,
    },
    {
      type: 'back',
      icon: <i className='fa-solid fa-backward-step'></i>,
    },
    {
      type: 'play',
      icon: <i className='fa-solid fa-circle-play'></i>,
      onClick: () => {
        setIsPlaying(true)
      },
    },
    {
      type: 'pause',
      icon: <i className='fa-solid fa-circle-pause'></i>,
      onClick: () => {
        setIsPlaying(false)
      },
    },
    {
      type: 'next',
      icon: <i className='fa-solid fa-forward-step'></i>,
    },
    {
      type: 'repeat',
      icon: <i className='fa-solid fa-repeat'></i>,
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
    },
    {
      type: 'volumeLow',
      icon: <i className='fa-solid fa-volume-low'></i>,
    },
    {
      type: 'volumeMute',
      icon: <i className='fa-solid fa-volume-xmark'></i>,
    },
    {
      type: 'expend',
      icon: <i className='fa-solid fa-up-right-and-down-left-from-center'></i>,
    },
  ]

  return (
    <footer className='app-footer play-bar-container'>
      <div className='song-details-container'>
        <img
          src='https://static.euronews.com/articles/stories/07/84/14/80/808x808_cmsv2_40962530-93b0-5765-87ff-a1f821e8801f-7841480.jpg'
          className='play-bar-cover'
          alt=''
        />
        <div className='song-text-container'>
          <span className='song-name'>Bla bla</span>
          <span className='song-artist'>By Blo blo</span>
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
                className={`${button.type}-button`}
              >
                {button.icon}
              </button>
            )
          })}
        </div>
        <div className='time-container'>
          <span>{currentTime}</span>
          <ProgressBar
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            duration={duration}
            playerRef={playerRef}
          />

          <ReactPlayer
            url={'public/Pokémon Theme.mp3'}
            style={{ display: 'none' }}
            playing={isPlaying}
            ref={playerRef}
          />
          <span>{duration}</span>
        </div>
      </div>

      <div className='buttons-volume-container'>
        <div className='buttons-container'>
          {buttonsContainer.map((button) => {
            if (button.type === 'volumeMute' && volume !== 0) return
            if (button.type === 'volumeHigh' && volume < 50) return
            if (button.type === 'volumeLow' && volume >= 50) return
            if (button.type === 'volumeLow' && volume === 0) return
            return <button key={button.type}>{button.icon}</button>
          })}
        </div>
        <VolumeBar volume={volume} setVolume={setVolume} />
      </div>
    </footer>
  )
}

const ProgressBar = ({ currentTime, duration, setCurrentTime, playerRef }) => {
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

const VolumeBar = ({ volume, setVolume }) => {
  const volumeRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const progressColor = isHovered ? '#1DB954' : '#FFFFFF'
    const trackColor = isHovered ? '#535353' : '#535353'

    volumeRef.current.style.background = `linear-gradient(to right, ${progressColor} ${volume}%, ${trackColor} ${volume}%)`
  }, [volume, isHovered])

  function onSetVolume({ target }) {
    const volumeToSet = +target.value
    setVolume(volumeToSet)
  }

  return (
    <div className='volume-container'>
      <input
        type='range'
        onChange={onSetVolume}
        value={volume}
        className='volume-progress'
        ref={volumeRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </div>
  )
}
