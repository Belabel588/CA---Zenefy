import React, { useState } from 'react'

import { FiEdit2 } from 'react-icons/fi'
import { CiCircleMinus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'

export function EditOptions({
  station,
  toggleModal,
  toggleEdit,
  editRef,
  position,
  isVisible,
  onDeleteStation,
}) {
  let id = 0

  const options = [
    {
      text: 'Edit',
      icon: <FiEdit2 />,
      onClick: () => {
        toggleModal()
      },
      id: ++id,
    },
    {
      text: 'Delete',
      icon: <CiCircleMinus />,
      onClick: () => {
        onDeleteStation(station)
      },
      id: ++id,
    },
    {
      text: 'Create',
      icon: <FaPlus />,
      onClick: () => {
        onCreateStation()
      },
      id: ++id,
    },
  ]

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
              key={option.id}
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
