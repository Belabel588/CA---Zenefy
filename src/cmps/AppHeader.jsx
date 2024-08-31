import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'
import { logout } from '../store/actions/user.actions.js'
import { FaSpotify, FaRegUserCircle } from 'react-icons/fa'
import { GoHome, GoHomeFill } from 'react-icons/go'
import { IoSearchOutline } from 'react-icons/io5'
import { PiBrowsersThin } from 'react-icons/pi'
import { RxCross2 } from 'react-icons/rx'
import zenefyLogo from '/public/img/zenefy-logo.png'
import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'

import { loadStations } from '../store/actions/station.actions.js'

import { logInUser } from '../store/actions/user.actions.js'

export function AppHeader() {
  const user = useSelector((storeState) => storeState.userModule.loggedinUser)
  const filterBy = useSelector(
    (storeState) => storeState.stationModule.filterBy
  )

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const inputRef = useRef(null) // Step 1: Create a ref for the input field
  const location = useLocation()
  const [isHome, setIsHome] = useState()

  const [userBy, setUserBy] = useState()

  useEffect(() => {
    if (location.pathname === '/') {
      setIsHome(true)
    } else {
      setIsHome(false)
    }
    // Step 2: Reset the input value on route change using the ref
    if (inputRef.current) {
      inputRef.current.value = '' // Clear the input value
    }
  }, [location])

  function debounce(func, delay) {
    let timeout
    return function (...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), delay)
    }
  }

  const handleSearch = debounce(({ target }) => {
    console.log('searching')
    const field = target.name
    let value = target.value

    // Dispatch action to update the filter in the Redux store
    dispatch({
      type: SET_FILTER_BY,
      filterBy: {
        ...filterBy,
        [field]: value,
      },
    })

    // Reload the stations with the updated filter
    // loadStations() stopped the filtering of the stations on the side.
  }, 800) // Debounce with a 300ms delay

  async function onLogout() {
    try {
      await logout()
      await loadStations()

      navigate('/')
      showSuccessMsg(`Bye now`)
    } catch (err) {
      showErrorMsg('Cannot logout')
    }
  }

  function onSearchClick() {
    if (inputRef.current) {
      inputRef.current.focus() // Focus the input field
    }
    navigate('/search')
  }

  async function onLoginGuest() {
    try {
      const user = await userService.guestLogin()
      const cred = { username: user.username, password: '' }
      const res = await logInUser(cred)
      await loadStations()
      navigate('/')
    } catch (err) {
      console.log(err)
      showErrorMsg('Error login')
    } finally {
      showSuccessMsg('Welcome')
    }
  }

  return (
    <header className='app-header full'>
      <nav>
        <NavLink to='/'>
          <div className='logo-container'>
            <img src={zenefyLogo} alt='' />
          </div>
        </NavLink>
      </nav>
      <div className='home-search-container'>
        <NavLink to='/' className='home-button-container'>
          {(isHome && <GoHomeFill className='home-button active' />) || (
            <GoHome className='home-button' />
          )}
        </NavLink>
        <div className='search-container' onClick={onSearchClick}>
          <IoSearchOutline className='icon search' />
          <input
            type='text'
            name='txt'
            onChange={handleSearch} // Use the debounced handleSearch
            placeholder='What do you want to play?'
            ref={inputRef} // Step 3: Bind the ref to the input field
          />
          <PiBrowsersThin className='icon browse' />
        </div>
      </div>

      {user?.isAdmin && <NavLink to='/admin'>Admin</NavLink>}

      {!user && (
        <div className='user-container'>
          <button onClick={onLoginGuest} className='guest-login-button'>
            Guest?
          </button>
          <NavLink to='login' className='login-link'>
            <FaRegUserCircle className='user-logo' />
          </NavLink>
        </div>
      )}
      {user && (
        <div className='user-info'>
          <Link to={`user/${user._id}`}>{user.fullname}</Link>
          <button onClick={onLogout}>logout</button>
        </div>
      )}
    </header>
  )
}
