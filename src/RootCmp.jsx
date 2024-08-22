import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'

import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'

import { HomePage } from '../src/pages/HomePage.jsx'
import { AboutUs } from '../src/pages/AboutUs.jsx'
import { SongIndex } from '../src/pages/SongIndex.jsx'
import { SongDetails } from '../src/pages/SongDetails.jsx'
import { UserDetails } from '../src/pages/UserDetails.jsx'
import { LoginSignup } from '../src/pages/LoginSignup.jsx'
import { SideBar } from './cmps/SideBar.jsx'
import { LikedSongs } from './cmps/LikedSongs.jsx'

export function RootCmp() {
  return (
    <section className='app main-layout'>
      <AppHeader />
      <SideBar />

      <div className='main-content'>
        <main>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/song' element={<SongIndex />} />
            <Route path='/song/:songId' element={<SongDetails />} />
            <Route path='/user/:userId' element={<UserDetails />} />
            <Route path='/login' element={<LoginSignup />} />
            <Route path='/likedSongs' element={<LikedSongs />} />
          </Routes>
        </main>
      </div>

      <AppFooter className='app-footer' />
    </section>
  )
}
