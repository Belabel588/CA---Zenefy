import { userService } from '../services/user.service.js'
import { SongPreview } from './SongPreview.jsx'

export function SongList({ songs, onRemoveSong, onUpdateSong }) {
  function shouldShowActionBtns(song) {
    const user = userService.getLoggedinUser()

    if (!user) return false
    if (user.isAdmin) return true
    return song.owner?._id === user._id
  }


  return (
    <section>
      <ul className='list'>
        {songs.map((song) => (
          <li key={song.id}>
            <SongPreview song={song} />
            {shouldShowActionBtns(song) && (
              <div className='actions'>
                <button onClick={() => onUpdateCar(song)}>Edit</button>
                <button onClick={() => onRemoveCar(song.id)}>x</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
