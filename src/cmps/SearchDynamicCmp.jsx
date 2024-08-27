import { stationService } from '../services/station.service'
import { loadStations } from '../store/actions/station.actions'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SET_FILTER_BY } from '../store/reducers/station.reducer'

export function SearchDynamicCmp() {
    const params = useParams()
    const dispatch = useDispatch()

    const [stationDataObj, setStationDataObj] = useState(null)
    const [error, setError] = useState(null)

    const filterBy = useSelector((storeState) => storeState.stationModule.filterBy)
    const stations = useSelector((storeState) => storeState.stationModule.stations)

    useEffect(() => {
        async function getData() {
            try {
                const data = await stationService.getStationData(params.stationId)
                setStationDataObj(data)

                if (data.stationsWithSameType && data.stationsWithSameType.length > 0) {
                    const stationType = data.stationsWithSameType[0].stationType
                    dispatch({ type: SET_FILTER_BY, filterBy: { ...filterBy, stationType } })
                }

                console.log('Fetched data:', data)
            } catch (err) {
                console.error('Failed to fetch data', err)
                setError('Failed to fetch data')
            }
        }

        getData()
    }, [params.stationId, dispatch])

    useEffect(() => {
        if (filterBy) {
            console.log('FILTERBY INSIDE OF DYNM CMP BEFORE LOAD STATIONS', filterBy)
            loadStations()
        }
    }, [filterBy, dispatch])

    if (error) return <h1>{error}</h1>

    console.log('STATIONS TO RENDER ARE::', stations)

    return (
        <div className='stations-in-category'>
            {stations && stations.length > 0 ? (
                <ul>
                    {stations.map((station) => (
                        <li key={station._id}>
                            <h2>{station.title}</h2>
                            <img src={station.cover} alt={`${station.title} cover`} width={200} />
                            <p>Tags: {station.tags.join(', ')}</p>
                            <p>Created by: {station.createdBy.fullname}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No stations found</p>
            )}
        </div>
    )
}
