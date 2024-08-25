import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import {
  ADD_STATION,
  SET_STATIONS,
  UPDATE_STATION,
  REMOVE_STATION,
} from '../store/reducers/station.reducer.js'

import { stationService } from '../services/stations.service.js'

import { LuClock3 } from 'react-icons/lu'
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { utilService } from '../services/util.service.js'

export function ItemDetails() {
  const { itemId } = useParams()
  const [item, setItem] = useState({ imgUrl: '', title: '' })

  useEffect(() => {
    getItem(itemId)
  }, [itemId])

  async function getItem(itemId) {
    const itemToSet = await stationService.getItem(itemId)
    console.log(itemToSet)
    setItem(itemToSet)
  }

  return (
    <section className='item-details-container'>
      <header className='item-header'>
        <img
          className='item-cover'
          src={
            item.imgUrl ||
            'https://images.prismic.io/milanote/df7eeb83a07162b45ac2e882cac055de9411054a_cover.jpg?auto=compress,format'
          }
        />

        <div className='title-container'>
          <span>Song</span>
          <b className='item-title'>{item.songName}</b>
          <span className='playlist-artist'>{item.artist}</span>
        </div>
      </header>
      <div className='user-interface-container'>
        <div className='buttons-container'>
          <div className='play-container'>
            <div className='play-button-container'>
              {/* {currSong.itemId === item.itemId ? (
              <BiPause className='pause-button' />
            ) : (
              <BiPlay className='play-button' />
            )} */}
            </div>
            <RxPlusCircled className='option-button plus-button' />
            <BsThreeDots className='option-button more-button' />
          </div>
        </div>
        <div className='item-info-container'>
          <div className='lyrics-container'>
            <b>Lyrics</b>
            <p>
              {item.lyrics ||
                `Load up on guns, bring your friends
It's fun to lose and to pretend
She's over-bored and self-assured
Oh no, I know a dirty word
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello
With the lights out, it's less dangerous
Here we are now, entertain us
I feel stupid and contagious
Here we are now, entertain us
A mulatto, an albino
A mosquito, my libido
Yeah
Hey
Yay
I'm worse at what I do best
And for this gift I feel blessed
Our little group has always been
And always will until the end
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello
With the lights out, it's less dangerous
Here we are now, entertain us
I feel stupid and contagious
Here we are now, entertain us
A mulatto, an albino
A mosquito, my libido
Yeah
Hey
Yay
And I forget just why I taste
Oh yeah, I guess it makes me smile
I found it hard, it's hard to find
Ooh well, whatever, nevermind
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello, how low
Hello, hello, hello
With the lights out, it's less dangerous
Here we are now, entertain us
I feel stupid and contagious
Here we are now, entertain us
A mulatto, an albino
A mosquito, my libido
A denial
A denial
A denial
A denial
A denial
A denial
A denial
A denial
A denial`}
            </p>
          </div>
          <div className='artist-container'>
            <img
              src='https://images.prismic.io/milanote/df7eeb83a07162b45ac2e882cac055de9411054a_cover.jpg?auto=compress,format'
              alt=''
            />
            <div className='title-container'>
              <b>Artist</b>
              <b>{item.artist}</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
