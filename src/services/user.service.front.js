import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { stationService } from './station.service.js'

export const userService = {
  getLoggedinUser,
  login,
  logout,
  signup,
  getById,
  query,
  getEmptyCredentials,
  updateUser,
  guestLogin,
}

const STORAGE_KEY_LOGGEDIN = 'loggedinUser'
const STORAGE_KEY = 'zenefyUserDB'

if (!localStorage.getItem(STORAGE_KEY)) {
  _createDemoUser()
}

function query() {
  return storageService.query(STORAGE_KEY)
}

function getById(userId) {
  return storageService.get(STORAGE_KEY, userId)
}

function login({ username, password }) {
  return storageService.query(STORAGE_KEY).then((users) => {
    let user
    if (username === 'Guest') {
      user = users.find((user) => user.username === 'Guest')
    } else {
      user = users.find(
        (user) => user.username === username && user.password === password
      )
    }
    if (user) return _setLoggedinUser(user)
    else return Promise.reject('Invalid login')
  })
}

async function signup({ username, password, fullname }) {
  const likedUserId = utilService.makeId()

  const user = {
    username,
    password,
    fullname,
    likedStationsIds: [likedUserId],
    likedSongsIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const savedUser = await storageService.post(STORAGE_KEY, user)
  _setLoggedinUser(savedUser)

  const userLikedStation = {
    _id: likedUserId,
    isLiked: true,
    stationType: 'music',
    title: 'Liked Songs',
    items: [],
    cover: 'https://misc.scdn.co/liked-songs/liked-songs-640.png', // Spotify's Liked Songs cover
    tags: [],
    createdBy: {
      _id: savedUser._id,
      fullname,
      imgUrl: '',
    },
    likedByUsers: [{ fullname, id: savedUser._id }],
    addedAt: Date.now(),
  }

  await storageService.post('stationDB', userLikedStation)
  return _setLoggedinUser(savedUser)
}

function logout() {
  sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
  return Promise.resolve()
}

function getLoggedinUser() {
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN))
}

function _setLoggedinUser(user) {
  const userToSave = {
    _id: user._id,
    fullname: user.fullname,
    likedStationsIds: user.likedStationsIds,
    likedSongsIds: user.likedSongsIds,
    imgUrl: user.imgUrl,
    // prefs: user.prefs,
  }

  sessionStorage.setItem(STORAGE_KEY_LOGGEDIN, JSON.stringify(userToSave))
  return userToSave
}

function getEmptyCredentials() {
  return {
    fullname: '',
    username: '',
    password: '',
  }
}

// Function to update user preferences in local storage
function updateUser(updatedUser) {
  const loggedinUser = getLoggedinUser()
  if (!loggedinUser) return Promise.reject('User not logged in')
  // Update the prefs of the logged-in user

  return storageService.put(STORAGE_KEY, updatedUser).then((user) => {
    // Update sessionStorage as well
    return _setLoggedinUser(user)
  })
}

/// USER DEMO

function _createDemoUser() {
  const demoUser = {
    _id: 'guest',
    fullname: 'Guest',
    username: 'Guest',
    imgUrl:
      'https://res.cloudinary.com/dpsnczn5n/image/upload/v1722939321/IMG_1626_qoscmz.jpg',

    likedStationsIds: [
      'likedSongs123',
      'yPlzCv',
      'PD9pQr',
      'UDmm7S',
      'PD7mNx',
      '0HP0UA',
      '0eNciX',
      '9F2K2W',
      'PD8kLm',
    ],
    likedSongsIds: [
      'creator1',
      'JX6Dy3',
      'G2G3h3',
      'ZAZIRK',
      '9je28A',

      '3J9rjg',
      'CT9zn5',
      'aew9tr',
      'HJuxQX',
      'zoaP5d',
    ],
  }
  return storageService.post(STORAGE_KEY, demoUser)
}

async function guestLogin() {
  try {
    const guest = await getById('guest')

    return guest
  } catch (err) {
    console.log(err)
  }
}
