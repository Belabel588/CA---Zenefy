import { useSelector } from 'react-redux'

import React, { useState, useEffect } from 'react'

export function AppFooter() {
  const [currentTime, setCurrentTime] = useState(0)
  const duration = 240 // Example duration (in seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prevTime) =>
        prevTime < duration ? prevTime + 1 : prevTime
      )
    }, 1000) // Simulate progress every second

    return () => clearInterval(interval)
  }, [duration])

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
    },
    {
      type: 'pause',
      icon: <i className='fa-solid fa-circle-pause'></i>,
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
        {controlButtons.map((button) => {
          return <button key={button}>{button.icon}</button>
        })}
        <div className='time-container'>
          <span>0:00</span>
          {/* <progress id='song-progress' value='0' max='100'></progress> */}
          <ProgressBar currentTime={currentTime} duration={duration} />
          <span>3:34</span>
        </div>
      </div>

      <div className='buttons-container'></div>
    </footer>
  )
}

const ProgressBar = ({ currentTime, duration }) => {
  const progressPercentage = (currentTime / duration) * 100

  return (
    <div className='progress-container'>
      <div
        className='progress-bar'
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  )
}
