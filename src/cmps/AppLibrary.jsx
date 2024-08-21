import { FaPlus } from "react-icons/fa6";


export function AppLibrary() {
  return (
    <div className="library-container">

      <p className="library-text">Your Library</p>
      <button>
        <FaPlus className="plus-icon" />
      </button>
    </div>
  )
}