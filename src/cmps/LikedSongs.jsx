import { LuClock3 } from "react-icons/lu";


export function LikedSongs() {
  return (
    <section className="liked-songs-container">

      <header className="liked-songs-header">
        <div>
          <img className="liked-songs-station-header-img" src="src/assets/styles/imgs/liked-songs.png" alt="liked songs playlist" />
        </div>

        <div className="liked-songs-header-texts">
          <p className="liked-songs-header-small">playlist</p>
          <h1 className="liked-songs-header-text">Liked Songs</h1>
        </div>

      </header>

      <table className="liked-songs-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Album</th>
            <th>Date Added</th>
            <th><LuClock3 /></th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </section>

  )
}