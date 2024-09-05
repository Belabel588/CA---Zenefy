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
import { IoClose } from 'react-icons/io5'

import { UserOptions } from './UserOptions.jsx'

import zenefyLogo from '/public/img/zenefy-logo.png'

import {
  SET_FILTER_BY,
  SET_IS_LOADING,
} from '../store/reducers/station.reducer.js'
import { setCurrSearch } from '../store/actions/station.actions.js'

import { loadStations, setIsActive } from '../store/actions/station.actions.js'

import { login, signup } from '../store/actions/user.actions.js'

export function AppHeader() {
  const user = useSelector((storeState) => storeState.userModule.loggedinUser)
  const filterBy = useSelector(
    (storeState) => storeState.stationModule.filterBy
  )
  const currSearch = useSelector(
    (stateSelector) => stateSelector.stationModule.currSearch
  )
  const isActive = useSelector(
    (stateSelector) => stateSelector.stationModule.isActive
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
      setCurrSearch('')
    } else {
      setIsHome(false)
    }
    setIsActive(false)
    // Step 2: Reset the input value on route change using the ref
    if (inputRef.current) {
      // inputRef.current.value = '' // Clear the input value
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

  useEffect(() => {
    if (filterBy.txt !== '') {
      dispatch({ type: SET_IS_LOADING, isLoading: true })
      setCurrSearch(filterBy.txt)
    }
  }, [filterBy])

  async function onLogout() {
    try {
      navigate('/')
      await logout()
      await loadStations()

      showSuccessMsg(`Bye now`)
    } catch (err) {
      showErrorMsg('Cannot logout')
    }
  }

  function onSearchClick() {
    if (inputRef.current) {
      inputRef.current.focus() // Focus the input field
      setIsActive(true)
    }
    navigate('/search')
  }

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
      showSuccessMsg('Welcome')
    }
  }

  const options = [
    {
      text: 'Profile',
      onClick: () => {
        navigate(`user/${user._id}`)
        setIsShown(false)
      },
    },
    {
      text: 'Log out',
      onClick: () => {
        onLogout()
        setIsShown(false)
      },
    },
  ]
  const isHover = useRef(false)
  const [isShown, setIsShown] = useState(false)

  function handleClickOutside() {
    if (!isHover.current) {
      setIsShown(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return (
    <header className='app-header full'>
      {isShown && <UserOptions options={options} isHover={isHover} />}
      <nav>
        <div
          onClick={async () => {
            await loadStations()
            navigate('/')
          }}
        >
          <div className='logo-container'>
            <img src={zenefyLogo} alt='' />
          </div>
        </div>
      </nav>
      <div className='home-search-container'>
        <div
          to='/'
          className='home-button-container'
          onClick={async () => {
            await loadStations()
            navigate('/')
          }}
        >
          {(isHome && <GoHomeFill className='home-button active' />) || (
            <GoHome className='home-button' />
          )}
        </div>
        <div className='search-container' onClick={onSearchClick}>
          <IoSearchOutline className='icon search' />
          <input
            type='text'
            name='txt'
            onChange={handleSearch} // Use the debounced handleSearch
            placeholder='What do you want to play?'
            ref={inputRef} // Step 3: Bind the ref to the input field
          />
          {(filterBy.txt && (
            <IoClose
              onClick={() => {
                inputRef.current.value = ''
              }}
            />
          )) || <PiBrowsersThin className='icon browse' />}
        </div>
      </div>

      {user?.isAdmin && <NavLink to='/admin'>Admin</NavLink>}

      {!user && (
        <div className='user-container'>
          <button onClick={onLoginGuest} className='guest-login-button'>
            Guest?
          </button>
          <NavLink to='login'>
            <FaRegUserCircle className='user-logo' />
          </NavLink>
        </div>
      )}
      {user && (
        <div
          className='user-container'
          onMouseUp={() => {
            setIsShown(true)
          }}
        >
          <div className='login-link'>
            {' '}
            <FaRegUserCircle className='user-logo' />
          </div>
        </div>
      )}
    </header>
  )
}
