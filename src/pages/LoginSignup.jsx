import { Outlet } from 'react-router'
import { NavLink, useNavigate } from 'react-router-dom'
import { userService } from '../services/user.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function LoginSignup() {
  const navigate = useNavigate()

  async function onLoginGuest() {
    try {
      const user = await userService.guestLogin()
      navigate('/')
    } catch (err) {
      console.log(err)
      showErrorMsg('Error login')
    } finally {
      showSuccessMsg('Welcome')
    }
  }
  return (
    <div className='login-page'>
      <nav>
        <NavLink to='.'>Login</NavLink>
        <NavLink to='signup'>Signup</NavLink>
      </nav>
      <Outlet />
      <button onClick={onLoginGuest} className='guest-login-button'>
        Guest?
      </button>
    </div>
  )
}
