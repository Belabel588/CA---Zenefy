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

import { UserMsg } from './cmps/UserMsg.jsx'

export function RootCmp() {
  return (
    <section className='app main-layout'>
      <AppHeader />
      <SideBar />
      <UserMsg />

      <div className='main-content'>
        <main>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/search' element={<SearchIndex />} />
            <Route path='/genere/:stationId' element={<SearchDynamicCmp />} />

            <Route path='/station/:stationId' element={<StationDetails />} />
            <Route path='/item/:itemId' element={<ItemDetails />} />
            <Route path='/user/:userId' element={<UserDetails />} />
            <Route path='/login' element={<LoginSignup />} />
          </Routes>
          {/* <StationEditModal /> */}
        </main>
      </div>

      <AppFooter className='app-footer' />
    </section>
  )
}
