export function SuggestedStations({ stations }) {
  return (
    <div className='suggested-stations-container'>
      {stations.map((station) => {
        return (
          <div className='station-container' key={station._id}>
            {station.title}
          </div>
        )
      })}
    </div>
  )
}
