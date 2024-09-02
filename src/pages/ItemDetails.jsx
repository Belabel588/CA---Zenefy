import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { stationService } from '../services/station.service.js'
import {
  setCurrStation,
  setCurrItem,
  setIsPlaying,
  setIsLoading,
  setCurrColor,
} from '../store/actions/station.actions.js'
import { LuClock3 } from 'react-icons/lu'
import { FaCirclePlay } from 'react-icons/fa6'
import { RxPlusCircled } from 'react-icons/rx'
import { BsThreeDots } from 'react-icons/bs'
import { IoListSharp } from 'react-icons/io5'
import { BiPlay, BiPause } from 'react-icons/bi'

export function ItemDetails() {
  const { itemId } = useParams()
  const [item, setItem] = useState({
    cover: '',
    name: '',
    artist: '',
    lyrics: '',
  })
  const isPlaying = useSelector((state) => state.stationModule.isPlaying)
  const isLoading = useSelector((state) => state.stationModule.isLoading)
  const currItem = useSelector((state) => state.stationModule.currItem)
  const currStation = useSelector((state) => state.stationModule.currStation)
  const currColor = useSelector((state) => state.stationModule.currColor)
  const headerRef = useRef()
  const gradientRef = useRef()

  const [itemsStation, setItemsStation] = useState(
    stationService.getEmptyStation()
  )

  useEffect(() => {
    async function fetchItem() {
      try {
        setIsLoading(true)
        const itemToSet = await stationService.getItem(itemId)
        const station = await stationService.getItemsStation(item.id)
        setItemsStation(station)
        setItem(itemToSet)
        const color = await setCurrColor(itemToSet.cover)
        headerRef.current.style.backgroundColor = color
        gradientRef.current.style.backgroundColor = color
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [itemId, currColor])

  if (isLoading) return <div>Loading...</div>

  return (
    <section className='item-details-container'>
      <header className='item-header' ref={headerRef}>
        <img className='item-cover' src={item.cover} alt={item.name} />
        <div className='title-container'>
          <span>Song</span>
          <b className='item-title'>{item.name}</b>
          <span className='playlist-artist'>{item.artist}</span>
        </div>
      </header>
      <div className='user-interface-container'>
        <div ref={gradientRef} className='gradient'></div>
        <div className='buttons-container'>
          <div className='play-container'>
            <div className='play-button-container'>
              {currItem.id === item.id && isPlaying ? (
                <BiPause
                  className='pause-button'
                  onClick={() => setIsPlaying(false)}
                />
              ) : (
                <BiPlay
                  className='play-button'
                  onClick={async () => {
                    // const station = await stationService.getItemsStation(
                    //   item.id
                    // )
                    if (
                      JSON.stringify(currStation) !==
                      JSON.stringify(itemsStation)
                    ) {
                      await setCurrStation(itemsStation._id)
                      await setCurrItem(item.id, itemsStation)
                    }
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
            <p>{item.lyrics || `Lyrics not available`}</p>
          </div>
          <div className='artist-container'>
            <img src={item.cover} alt={item.artist} />
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
