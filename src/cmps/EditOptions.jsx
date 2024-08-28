import React, { useState } from 'react'

import { FiEdit2 } from 'react-icons/fi'
import { CiCircleMinus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'

export function EditOptions({
  options,
  station,
  toggleModal,

  position,
  isVisible,
  onDeleteStation,
  onCreateNewStation,
}) {
  let id = 0

  return (
    <>
      {isVisible && (
        <div
          className='edit-options-container'
          style={{
            top: `${position.y}px`,
            left: `calc( ${position.x}px - 19vw)`,
            position: 'absolute',
          }}
        >
          {options.map((option) => (
            <div
              className='option-container'
              key={++id}
              onClick={option.onClick}
            >
              {option.icon}
              <span>{option.text}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
