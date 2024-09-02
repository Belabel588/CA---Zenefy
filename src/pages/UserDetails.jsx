import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { login } from '../store/actions/user.actions.js'
import { store } from '../store/store.js'
import { showSuccessMsg } from '../services/event-bus.service.js'
import {
  socketService,
  SOCKET_EVENT_USER_UPDATED,
  SOCKET_EMIT_USER_WATCH,
} from '../services/socket.service.js'

export function UserDetails() {
  const params = useParams()
  const user = useSelector((storeState) => storeState.userModule.watchedUser)

  useEffect(() => {
    // logInUser(params.id)
    // socketService.emit(SOCKET_EMIT_USER_WATCH, params.id)
    // socketService.on(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
    // return () => {
    //   socketService.off(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
    // }
  }, [params.id])

  function onUserUpdate(user) {
    showSuccessMsg(
      `This user ${user.fullname} just got updated from socket, new score: ${user.score}`
    )
    store.dispatch({ type: 'SET_WATCHED_USER', user })
  }

  return (
    <section className='user-details'>
      <h1>User Details</h1>
      {user && (
        <div>
          <h3>{user.fullname}</h3>
          <img src={user.imgUrl} style={{ width: '100px' }} />
          <pre> {JSON.stringify(user, null, 2)} </pre>
        </div>
      )}
    </section>
  )
}
