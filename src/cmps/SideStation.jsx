import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'


export function SideStation() {
    const [isSideOpen, setIsSideOpen] = useState(false)
    const currStation = useSelector(
        (stateSelector) => stateSelector.stationModule.currStation
    )

    const isPlaying = useSelector(
        (stateSelector) => stateSelector.stationModule.isPlaying
    )

    useEffect(() => {
        console.log('isPlaying inside side station', isPlaying);
        setIsSideOpen(true)


    }, [isPlaying])

    function onCloseSideStation(){
        setIsSideOpen(false)
    }


        console.log(isSideOpen);


    return (
        <>
            {isSideOpen && (
                <div className='hidden side-station' >
                    <button onClick={onCloseSideStation}>X</button>
                    ITS THE SIDE SIDE STATION
                </div>
            )}
        </>
    )

}