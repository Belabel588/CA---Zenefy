import { FaPlus } from 'react-icons/fa6'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router'
import { SET_FILTER_BY } from '../store/reducers/station.reducer.js'
import { stationService } from '../services/station.service'
import { utilService } from '../services/util.service.js'
import { loadStations, setIsLoading } from '../store/actions/station.actions'
import {
  setIsPlaying,
  setCurrStation,
  setCurrItem,
  saveStation,
  setFilter,
} from '../store/actions/station.actions.js'
import { updateUser } from '../store/actions/user.actions.js'

import { apiService } from '../services/youtube-spotify.service.js'

import { BiPlay } from 'react-icons/bi'
import { BiPause } from 'react-icons/bi'
import { IoSearch } from 'react-icons/io5'
import { IoCloseOutline } from 'react-icons/io5'
import { LuSparkles } from 'react-icons/lu'
import { LuDot } from 'react-icons/lu'

export function GeminiChat() {
  const navigate = useNavigate()
  const [isGemini, setIsGemini] = useState(false)

  const [generateButton, setGenerateButton] = useState()
  const inputRef = useRef()
  const [geminiLoader, setGeminiLoader] = useState(false)

  const [msgs, setMsgs] = useState([])
  const [generating, setGenerating] = useState({ text: 'Generating' })

  useEffect(() => {
    setGeminiMsg()
  }, [])
  function onSetGeminiModal() {
    if (isGemini) {
      setIsGemini(false)
    } else {
      setIsGemini(true)
    }
  }

  async function handleUserPrompt() {
    try {
      if (!prompt) return
      if (geminiLoader) return
      setPrompt('')

      const newMsgs = msgs
      newMsgs.unshift({
        text: prompt,
        id: utilService.makeId(),
        className: 'msg me',
      })
      setMsgs([...newMsgs])
      geminiRef.current.className = 'loading-button'
      setGeminiLoader(true)
      onSetGenerate()
      const geminiStation = await apiService.geminiGenerate(prompt)

      navigate(`/station/${geminiStation._id}`)
    } catch (err) {
      console.log(err)
    } finally {
      geminiRef.current.className = ''
      setIsGemini(false)
      setGeminiLoader(false)
    }
  }
  const [prompt, setPrompt] = useState('')
  function handlePromptChange({ target }) {
    setPrompt(target.value)
  }

  const geminiRef = useRef()

  function setGeminiMsg() {
    const first = [
      {
        text: <div></div>,
        className: 'msg typing',
        id: utilService.makeId(),
      },
    ]

    setMsgs(first)

    const geminiMsg = {
      text: `You can generate a playlist with any prompt`,
      className: 'msg',
      id: utilService.makeId(),
    }
    const newMsgs = []
    newMsgs.push(geminiMsg)
    setTimeout(() => {
      setMsgs(newMsgs)
    }, 3000)
  }

  function onSetGenerate() {
    let time = 0
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        setGenerating({ ...generating, text: 'Generating.' })
      }, time + 500)
      time = time + 500
      setTimeout(() => {
        setGenerating({ ...generating, text: 'Generating..' })
      }, time + 500)
      time = time + 500
      setTimeout(() => {
        setGenerating({ ...generating, text: 'Generating...' })
      }, time + 500)
      time = time + 500
    }
  }

  return (
    <div className='gemini-modal-container'>
      {!geminiLoader ? (
        <div>
          <span>Generate by prompt</span>
        </div>
      ) : (
        <div className='generating'>
          <span>{generating.text}</span>
        </div>
      )}

      <ul className='msgs-container'>
        <div className='user-interface'>
          <input type='text' onChange={handlePromptChange} />
          <div className='button-container'>
            <button ref={geminiRef} onClick={handleUserPrompt}>
              {geminiLoader ? '' : 'Generate'}
            </button>
          </div>
        </div>
        {msgs.map((msg) => {
          return (
            <li key={msg.id} className={msg.className}>
              {msg.text}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
