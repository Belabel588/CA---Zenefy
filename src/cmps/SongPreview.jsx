import { Link } from 'react-router-dom'

import { SongLyrics } from './SongLyrics.jsx'
import { ArtistDetails } from './ArtistDetails.jsx'

export function SongPreview({ song }) {
  return (
    <article className='preview'>
      <header>
        <Link to={`/song/${song._id}`}>{song.name}</Link>
      </header>

      <p>{/* Speed: <span>{song.speed.toLocaleString()} Km/h</span> */}</p>
      {song.owner && (
        <p>
          Owner: <span>{song.owner.fullname}</span>
        </p>
      )}
      <SongLyrics />
      <ArtistDetails />
    </article>
  )
}
