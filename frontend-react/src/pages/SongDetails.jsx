import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { loadSong, addSongMsg } from '../store/actions/song.actions'

export function CarDetails() {
  const { songId } = useParams()
  const song = useSelector((storeState) => storeState.songModule.song)

  useEffect(() => {
    loadSong(songId)
  }, [songId])

  async function onAddSongMsg(songId) {
    try {
      await addSongMsg(songId, 'bla bla ' + parseInt(Math.random() * 10))
      showSuccessMsg(`Song msg added`)
    } catch (err) {
      showErrorMsg('Cannot add song msg')
    }
  }

  return (
    <section className='song-details'>
      <Link to='/song'>Back to list</Link>
      <h1>Song Details</h1>
      {song && (
        <div>
          <h3>{song.name}</h3>
          {/* <h4>${song.price}</h4>
          <pre> {JSON.stringify(song, null, 2)} </pre> */}
        </div>
      )}
      <button
        onClick={() => {
          onAddSongMsg(song._id)
        }}
      >
        Add song msg
      </button>
    </section>
  )
}
