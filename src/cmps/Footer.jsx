import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa'
import { FaGithub } from 'react-icons/fa'

export function Footer() {
  const navigate = useNavigate()
  return (
    <div className='spotify-footer'>
      <div className='footer-content'>
        <div className='footer-links'>
          <FaGithub
            onClick={() =>
              window.open('https://github.com/Belabel588/CA---Zenefy')
            }
          />
        </div>

        <div className='footer-socials'></div>

        <div className='footer-copyright'>
          <p>&copy; 2024 Zenefy. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}
