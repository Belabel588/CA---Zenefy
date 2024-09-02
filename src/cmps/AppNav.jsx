import { GoHome } from "react-icons/go";
import { IoSearchSharp } from "react-icons/io5";



export function AppNav() {
  return (
    <div className="nav-container">

      <nav>

        <div className="home-nav-container">
          <button className="home-btn">
            <GoHome className="home-icon" />
            <p className="home-text">Home</p>
          </button>
        </div>

        <div className="search-nav-container">
          <button className="search-btn">
            <IoSearchSharp className="search-icon" />
            <p className="search-text">Search</p>
          </button>
        </div>


      </nav>
    </div>
  )
}