// LoadingAnimation.jsx
import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

export function LoadingAnimation() {
  const isLoading = useSelector(
    (stateSelector) => stateSelector.stationModule.isLoading
  )

  if (isLoading)
    return (
      // <div className='back-shadow'>
      <div className='loading-container'>
        <div className='loading-animation'>
          <div className='bar'></div>
          <div className='bar'></div>
          <div className='bar'></div>
          <div className='bar'></div>
          <div className='bar'></div>
        </div>
      </div>
      // </div>
    )
}
