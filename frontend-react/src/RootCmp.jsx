import React from 'react'
import { Routes, Route } from 'react-router'

import { HomePage } from './pages/HomePage'
import { AboutUs, AboutTeam, AboutVision } from './pages/AboutUs'
import { SongIndex } from './pages/SongIndex.jsx'
import { AdminIndex } from './pages/AdminIndex.jsx'

import { SongDetails } from './pages/SongDetails.jsx'
import { UserDetails } from './pages/UserDetails.jsx'

import { AppHeader } from './cmps/AppHeader'
import { AppFooter } from './cmps/AppFooter'

import { LoginSignup } from './pages/LoginSignup.jsx'

export function RootCmp() {
  return (
    <div className='main-container'>
      <AppHeader />

      <main>
        <Routes>
          <Route path='' element={<HomePage />} />
          <Route path='about' element={<AboutUs />}>
            <Route path='team' element={<AboutTeam />} />
            <Route path='vision' element={<AboutVision />} />
          </Route>
          <Route path='song' element={<SongIndex />} />
          <Route path='song/:songId' element={<SongDetails />} />
          <Route path='user/:id' element={<UserDetails />} />
          <Route path='admin' element={<AdminIndex />} />
          <Route path='login' element={<LoginSignup />} />
        </Routes>
      </main>
      <AppFooter />
    </div>
  )
}
