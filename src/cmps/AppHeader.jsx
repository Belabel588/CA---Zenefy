import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { useLocation } from 'react-router-dom'

import { useSelector } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { logout } from '../store/actions/user.actions.js'
import { FaSpotify } from 'react-icons/fa'
import { FaRegUserCircle } from 'react-icons/fa'
import { GoHome } from 'react-icons/go'
import { GoHomeFill } from 'react-icons/go'
// import { CiSearch } from 'react-icons/ci'
import { IoSearchOutline } from 'react-icons/io5'

import { PiBrowsersThin } from 'react-icons/pi'
import { RxCross2 } from 'react-icons/rx'

import zenefyLogo from '/public/img/zenefy-logo.png'

export function AppHeader() {
  const user = useSelector((storeState) => storeState.userModule.user)
  const navigate = useNavigate()
  const [isFocus, setIsFocus] = useState()
  const inputRef = useRef()
  const location = useLocation()
  const [isHome, setIsHome] = useState()

  useEffect(() => {
    if (location.pathname === '/') {
      setIsHome(true)
    } else {
      setIsHome(false)
    }
  }, [location])

  async function onLogout() {
    try {
      await logout()
      navigate('/')
      showSuccessMsg(`Bye now`)
    } catch (err) {
      showErrorMsg('Cannot logout')
    }
  }

  function onSearchClick() {
    inputRef.current.focus()
    navigate('/song')
  }

  return (
    <header className='app-header full'>
      <nav>
        <NavLink to='/'>
          {/* <FaSpotify className='app-logo' /> */}
          <div className='logo-container'>
            <img src={zenefyLogo} alt='' />
            <b>Zenefy</b>
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
            placeholder='What do you want to play?'
            ref={inputRef}
          />
          {(isFocus && <RxCross2 className='icon close' />) || (
            <PiBrowsersThin className='icon browse' />
          )}
        </div>
      </div>

      {user?.isAdmin && <NavLink to='/admin'>Admin</NavLink>}

      {!user && (
        <NavLink to='login' className='login-link'>
          <FaRegUserCircle className='user-logo' />
        </NavLink>
      )}
      {user && (
        <div className='user-info'>
          <Link to={`user/${user._id}`}>
            {/* {user.imgUrl && <img src={user.imgUrl} />} */}
            {user.fullname}
          </Link>
          {/* <span className="score">{user.score?.toLocaleString()}</span> */}
          <button onClick={onLogout}>logout</button>
        </div>
      )}
    </header>
  )
}
