import { stationService } from '../services/station.service'
import { loadStations } from '../store/actions/station.actions'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SET_FILTER_BY } from '../store/reducers/station.reducer'
import { StationList } from './StationList'

export function SearchDynamicCmp() {
    const params = useParams()
    const dispatch = useDispatch()

    const [stationDataObj, setStationDataObj] = useState(null)
    const [error, setError] = useState(null)

    const filterBy = useSelector((storeState) => storeState.stationModule.filterBy)
    const stations = useSelector((storeState) => storeState.stationModule.stations)
    const generateColor = (index, total) => {
        const hue = (index / total) * 360
        return `hsl(${hue}, 70%, 50%)`
    }

    useEffect(() => {
        async function getData() {
            try {
                const data = await stationService.getStationData(params.stationId)
                setStationDataObj(data)

                if (data.stationsWithSameType && data.stationsWithSameType.length > 0) {
                    const stationType = data.stationsWithSameType[0].stationType
                    dispatch({ type: SET_FILTER_BY, filterBy: { ...filterBy, stationType } })
                }

                
            } catch (err) {
                console.error('Failed to fetch data', err)
                setError('Failed to fetch data')
            }
        }

        getData()
    }, [params.stationId, dispatch])

    useEffect(() => {
        if (filterBy) {
            
            loadStations()
        }
    }, [filterBy, dispatch])




    if (error) return <h1>{error}</h1>

    

    return (
        <div className='main-search-container'>
            <StationList />

            {stationDataObj?.combinedTags && (
                <div className="search-tags">
                    {stationDataObj.combinedTags.map((tag, idx) => (
                        <div key={idx} className="tag" style={{
                            backgroundColor: generateColor(idx, stations.length),
                        }}>
                            <span>{tag}</span>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}
