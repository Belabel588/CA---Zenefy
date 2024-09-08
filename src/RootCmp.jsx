import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'

import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'
import { SearchDynamicCmp } from './cmps/SearchDynamicCmp.jsx'

import { HomePage } from '../src/pages/HomePage.jsx'
import { AboutUs } from '../src/pages/AboutUs.jsx'
import { SearchIndex } from '../src/pages/SearchIndex.jsx'
import { StationDetails } from './pages/StationDetails.jsx'
import { ItemDetails } from './pages/ItemDetails.jsx'
import { UserDetails } from '../src/pages/UserDetails.jsx'
import { LoginSignup } from '../src/pages/LoginSignup.jsx'
import { SideBar } from './cmps/SideBar.jsx'
import { StationEditModal } from './cmps/StationEditModal.jsx'
import { OptionsModal } from './cmps/OptionsModal.jsx'
import { ArtistDetails } from './pages/ArtistDetails.jsx'

import { UserMsg } from './cmps/UserMsg.jsx'
import { LoadingAnimation } from './cmps/LoadingAnimation.jsx'
import { AppHeaderMobile } from './cmps/AppHeaderMobile.jsx'
import { AppFooterMobile } from './cmps/AppFooterMobile.jsx'

export function RootCmp() {
  return (
    <section className='app main-layout'>
      {/* <AppHeaderMobile /> */}
      <AppHeader />
      <SideBar />
      <UserMsg />
      <LoadingAnimation />
      <LoginSignup />

      <div className='main-content'>
        <main>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/search' element={<SearchIndex />} />
            <Route path='/genere/:category' element={<SearchDynamicCmp />} />

            <Route path='/station/:stationId' element={<StationDetails />} />
            <Route path='/item/:itemId' element={<ItemDetails />} />
            <Route path='/user/:userId' element={<UserDetails />} />
            {/* <Route path='/login' element={<LoginSignup />} /> */}
            <Route path='/artist/:artistId' element={<ArtistDetails />} />
          </Routes>
          {/* <StationEditModal /> */}
        </main>
      </div>

      <AppFooterMobile />
      <AppFooter className='app-footer' />
    </section>
  )
}
