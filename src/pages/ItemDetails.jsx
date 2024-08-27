import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { stationService } from '../services/station.service.js'
import { utilService } from '../services/util.service.js'

import {
  setCurrStation,
  setCurrItem,
  setIsPlaying,
} from '../store/actions/station.actions.js'

import { LuClock3 } from 'react-icons/lu'
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'

export function ItemDetails() {
  const { itemId } = useParams()
  const [item, setItem] = useState({ imgUrl: '', title: '' })

  const isPlaying = useSelector(
    (stateSelector) => stateSelector.stationModule.isPlaying
  )

  const currItem = useSelector(
    (stateSelector) => stateSelector.stationModule.currItem
  )
  const currStation = useSelector(
    (stateSelector) => stateSelector.stationModule.currStation
  )

  useEffect(() => {
    getItem(itemId)
  }, [itemId])

  async function getItem(itemId) {
    const itemToSet = await stationService.getItem(itemId)
    setItem(itemToSet)
  }

  return (
    <section className='item-details-container'>
      <header className='item-header'>
        <img className='item-cover' src={item.cover} />

        <div className='title-container'>
          <span>Song</span>
          <b className='item-title'>{item.name}</b>
          <span className='playlist-artist'>{item.artist}</span>
        </div>
      </header>
      <div className='user-interface-container'>
        <div className='buttons-container'>
          <div className='play-container'>
            <div className='play-button-container'>
              {currItem.id === item.id && isPlaying ? (
                <BiPause
                  className='pause-button'
                  onClick={() => {
                    setIsPlaying(false)
                  }}
                />
              ) : (
                <BiPlay
                  className='play-button'
                  onClick={async () => {
                    const station = await stationService.getItemsStation(
                      item.id
                    )
                    if (
                      JSON.stringify(currStation) !== JSON.stringify(station)
                    ) {
                      await setCurrStation(station._id)
                    }
                    await setCurrItem(item.id, station)

                    setIsPlaying(true)
                  }}
                />
              )}
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
            <img src={item.cover} alt='' />
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
