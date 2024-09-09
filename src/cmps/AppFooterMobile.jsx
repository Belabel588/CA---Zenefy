import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { GoHome, GoHomeFill } from 'react-icons/go'
import { IoSearchOutline } from 'react-icons/io5'
// import { PiBrowsersThin } from 'react-icons/pi'

export function AppFooterMobile() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      setIsHome(true)
      setPage('/')
    } else if (location.pathname === '/search') {
      setIsHome(false)
      setPage('/search')
    } else if (location.pathname === '/library') {
      setPage('/library')
    }
    // Step 2: Reset the input value on route change using the ref
    if (inputRef.current) {
      inputRef.current.value = '' // Clear the input value
    }
  }, [location])

  const [isHome, setIsHome] = useState()
  const inputRef = useRef(null)
  const [page, setPage] = useState('/')

  function onSearchClick() {
    if (inputRef.current) {
      inputRef.current.focus() // Focus the input field
    }
    navigate('/search')
  }

  return (
    <div className='app-mobile-footer'>
      <NavLink to='/' className='home-button-container'>
        {(isHome && <GoHomeFill className='home-button active' />) || (
          <GoHome className='home-button' />
        )}
        <p>Home</p>
      </NavLink>

      <div
        className={
          page === '/search' ? 'search-container active' : 'search-container'
        }
        onClick={onSearchClick}
      >
        <IoSearchOutline className='icon search' />
        {/* <PiBrowsersThin className='icon browse' /> */}
        <p>Search</p>
      </div>

      <div
        className={
          page === '/library' ? 'library-title active' : 'library-title'
        }
      >
        <svg
          className='library-icon'
          xmlns='http://www.w3.org/2000/svg'
          role='img'
          height='24'
          width='24'
          aria-hidden='true'
          viewBox='0 0 24 24'
          data-encore-id='icon'
        >
          <path
            d='M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z'
            fill='#b3b3af'
          ></path>
        </svg>
        <p className='library-text'>Your Library</p>
      </div>
    </div>
  )
}
