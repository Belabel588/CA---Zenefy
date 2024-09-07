import React from 'react'

import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa'

export function Footer() {
  return (
    <div className='spotify-footer'>
      <div className='footer-content'>
        <div className='footer-links'>
          <ul>
            <li>
              <a href='#'>Legal</a>
            </li>
            <li>
              <a href='#'>Privacy Center</a>
            </li>
            <li>
              <a href='#'>Privacy Policy</a>
            </li>
          </ul>
        </div>

        <div className='footer-socials'>
          <a
            href='https://www.facebook.com'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaFacebookF />
          </a>
          <a
            href='https://www.twitter.com'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaTwitter />
          </a>
          <a
            href='https://www.instagram.com'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaInstagram />
          </a>
        </div>

        <div className='footer-copyright'>
          <p>&copy; 2024 Zenefy. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}
