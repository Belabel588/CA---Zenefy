import { Outlet } from 'react-router'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { userService } from '../services/user.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { login } from '../store/actions/user.actions.js'
import { signup } from '../store/actions/user.actions.js'

import { loadStations } from '../store/actions/station.actions.js'
import zenefyLogo from '/public/img/zenefy-logo.png'

export function LoginSignup() {
  const navigate = useNavigate()

  async function onLoginGuest() {
    try {
      const user = await userService.guestLogin()
      const cred = { username: user.username, password: '' }
      const res = await login(cred)
      await loadStations()
      navigate('/')
    } catch (err) {
      console.log(err)
      showErrorMsg('Error login')
    } finally {
      // showSuccessMsg('Welcome')
    }
  }

  const user = useSelector(
    (stateSelector) => stateSelector.userModule.loggedinUser
  )

  const [isSignup, setIsSignUp] = useState(user)
  const [credentials, setCredentials] = useState(
    userService.getEmptyCredentials()
  )

  useEffect(() => {
    loadStations()
  }, [user])

  function handleChange({ target }) {
    const { name: field, value } = target
    setCredentials((prevCreds) => ({ ...prevCreds, [field]: value }))
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    onLogin(credentials)
  }
  function onLogin(credentials) {
    isSignup
      ? signup(credentials)
          .then((loggedinUser) => {
            setCredentials(userService.getEmptyCredentials())
            // showSuccessMsg('Signed in successfully')
          })

          .catch((err) => {
            console.log(err)
            // showErrorMsg('Oops try again')
          })
      : login(credentials)
          .then((data) => {
            setCredentials(userService.getEmptyCredentials())
            // backshadowRef.current.style.display = 'none'
            loadStations()
            // showSuccessMsg('Logged in successfully')
          })
          .catch((err) => {
            // showErrorMsg('Oops try again')
          })
  }
  if (!user)
    return (
      <div className='back-shadow'>
        <div className='login-container'>
          {/* <div className='login-page'> */}

          {/* <nav>
            <NavLink to='.'>Login</NavLink>
            <NavLink to='signup'>Signup</NavLink>
          </nav>
          <Outlet /> */}

          {/* </div> */}

          <img src={zenefyLogo} alt='' />
          {/* <h2>{isSignup ? 'Signup to Zenefy' : 'Login to Zenefy'}</h2> */}

          <h3>{isSignup ? 'Signup' : 'Login'}</h3>
          <div className='btns'>
            <a
              href='#'
              onClick={() => setIsSignUp(!isSignup)}
              style={{ padding: '15px' }}
            >
              {isSignup ? 'Already a member? Login' : 'New user? Signup here'}
            </a>
          </div>
          <form className='login-form' onSubmit={handleSubmit}>
            <input
              type='text'
              name='username'
              value={credentials.username}
              placeholder='Username'
              onChange={handleChange}
              required
              autoFocus
            />
            <input
              type='password'
              name='password'
              value={credentials.password}
              placeholder='Password'
              onChange={handleChange}
              required
              autoComplete='off'
            />
            {isSignup && (
              <input
                type='text'
                name='fullname'
                value={credentials.fullname}
                placeholder='Full name'
                onChange={handleChange}
                required
              />
            )}
            <button className='guest-login-button'>
              {isSignup ? 'Signup' : 'Login'}
            </button>
          </form>
          <button onClick={onLoginGuest} className='guest-login-button'>
            Guest?
          </button>
        </div>
      </div>
    )
}
