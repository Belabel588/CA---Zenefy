import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'
import { utilService } from '../services/util.service.js'
import { logout } from '../store/actions/user.actions.js'
import { FaSpotify, FaRegUserCircle } from 'react-icons/fa'
import { GoHome, GoHomeFill } from 'react-icons/go'
import { IoSearchOutline } from 'react-icons/io5'
import { PiBrowsersThin } from 'react-icons/pi'
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
import { stationService } from '../services/station.service.js'

export function AppHeader() {
  const user = useSelector((storeState) => storeState.userModule.loggedinUser);
  const filterBy = useSelector(
    (storeState) => storeState.stationModule.filterBy
  );
  const currSearch = useSelector(
    (stateSelector) => stateSelector.stationModule.currSearch
  );
  const isActive = useSelector(
    (stateSelector) => stateSelector.stationModule.isActive
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const inputRef = useRef(null) // Step 1: Create a ref for the input field
  
  const [isHome, setIsHome] = useState()
  const [isFocus, setIsFocus] = useState(false)

  const [userBy, setUserBy] = useState()
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (location.pathname === '/') {
      setIsHome(true);
      setCurrSearch('');
    } else {
      setIsHome(false);
    }
    setIsActive(false)

    if (location.pathname === '/search') {
      setIsFocus(true)
    } else {
      setIsFocus(false)
    }

    // Step 2: Reset the input value on route change using the ref
    if (inputRef.current) {
      inputRef.current.value = ''; // Clear the input value
    }
  }, [location])

  const handleSearch = utilService.debounce(({ target }) => {
    const field = target.name
    console.log(field)
    let value = target.value
    console.log(value)
    setSearchTerm(value)
    // Dispatch action to update the filter in the Redux store
    // dispatch({
    //   type: SET_FILTER_BY,
    //   filterBy: {
    //     ...filterBy,
    //     [field]: value,
    //   },
    // })

    // Reload the stations with the updated filter
    // loadStations() stopped the filtering of the stations on the side.
  }, 800) // Debounce with a 300ms delay

  useEffect(() => {
    if (searchTerm !== '') {
      // console.log(inputRef.value)
      // dispatch({ type: SET_IS_LOADING, isLoading: true })
      setCurrSearch(searchTerm)
    }
  }, [searchTerm])

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

  function onSearchClick({ target }) {
    if (inputRef.current) {
      

      inputRef.current.focus() // Focus the input field
      setIsFocus(true)
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
            id='text'
            onChange={handleSearch} // Use the debounced handleSearch
            placeholder='What do you want to play?'
            ref={inputRef} // Step 3: Bind the ref to the input field
            // value={searchTerm}
          />
          {(filterBy.txt && (
            <IoClose
              onClick={() => {
                inputRef.current.value = ''
              }}
            />
          )) || <ExploreIcon isFocus={isFocus} />}
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
            {(user.imgUrl && (
              <img className='user-logo' src={user.imgUrl} alt='' />
            )) || <FaRegUserCircle className='user-logo' />}
          </div>
        </div>
      )}
    </header>
  )
}

function ExploreIcon({ isFocus }) {
  console.log(isFocus)
  if (isFocus) {
    return (
      <svg
        data-encore-id='icon'
        role='img'
        aria-hidden='true'
        viewBox='0 0 24 24'
        className='explore active'
      >
        <path d='M4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4H4V2zM1.513 9.37A1 1 0 0 1 2.291 9H21.71a1 1 0 0 1 .978 1.208l-2.17 10.208A2 2 0 0 1 18.562 22H5.438a2 2 0 0 1-1.956-1.584l-2.17-10.208a1 1 0 0 1 .201-.837zM12 17.834c1.933 0 3.5-1.044 3.5-2.333 0-1.289-1.567-2.333-3.5-2.333S8.5 14.21 8.5 15.5c0 1.289 1.567 2.333 3.5 2.333z'></path>
      </svg>
    )
  } else {
    return (
      <svg
        data-encore-id='icon'
        role='img'
        aria-hidden='true'
        viewBox='0 0 24 24'
        className='explore'
      >
        <path d='M15 15.5c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z'></path>
        <path d='M1.513 9.37A1 1 0 0 1 2.291 9h19.418a1 1 0 0 1 .979 1.208l-2.339 11a1 1 0 0 1-.978.792H4.63a1 1 0 0 1-.978-.792l-2.339-11a1 1 0 0 1 .201-.837zM3.525 11l1.913 9h13.123l1.913-9H3.525zM4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4h-2V3H6v3H4V2z'></path>
      </svg>
    )
  }
}
