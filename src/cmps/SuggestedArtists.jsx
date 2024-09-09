import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { utilService } from '../services/util.service.js'
import { setCurrArtist } from '../store/actions/artist.actions.js'

export function SuggestedArtists({ artists }) {
  console.log(artists)
  const navigate = useNavigate()
  const [isHover, setIsHover] = useState(false)
  return (
    <div className='artists-container'>
      {artists.map((artist) => {
        return (
          <div
            className='artist-container'
            key={artist.id}
            onClick={() => {
              setCurrArtist(artist)
              navigate(`/artist/${artist.id}`)
            }}
          >
            {(artist.images.length > 0 &&
              (<img src={artist.images[0].url} alt='' /> || (
                  <img src={artist.images[0].url} alt='' />
                ) || (
                  <img
                    src={
                      'https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021'
                    }
                    alt=''
                  />
                ))) || (
              <img
                src={
                  'https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021'
                }
                alt=''
              />
            )}
            <b>{artist.name}</b>
            <span>{utilService.capitalizeFirstLetter(artist.type)}</span>
          </div>
        )
      })}
    </div>
  )
}
