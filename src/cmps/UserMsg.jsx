import { eventBusService } from '../services/event-bus.service.js'

import { useEffect, useState } from 'react'

// import '../css/UserMsg.css'

export function UserMsg() {
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const unsubscribe = eventBusService.on('show-user-msg', (msg) => {
      setMsg(msg)
      setTimeout(onCloseMsg, 1500)
    })

    return () => {
      //   debugger
      unsubscribe()
    }
  }, [])

  function onCloseMsg() {
    setMsg(null)
  }

  if (!msg) return null

  return (
    <section className={'user-msg ' + msg.type}>
      <p>{msg.txt}</p>
    </section>
  )
}
