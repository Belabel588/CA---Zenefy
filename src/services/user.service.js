import { storageService } from "./async-storage.service.js"

export const userService = {
    getLoggedinUser,
    login,
    logout,
    signup,
    getById,
    query,
    getEmptyCredentials,
    updateUserPrefs
}

const STORAGE_KEY_LOGGEDIN = 'loggedinUser'
const STORAGE_KEY = 'userDB'

function query() {
    return storageService.query(STORAGE_KEY)
}

function getById(userId) {
    return storageService.get(STORAGE_KEY, userId)
}

function login({ username, password }) {
    return storageService.query(STORAGE_KEY)
        .then(users => {
            const user = users.find(user => user.username === username && user.password === password)
            if (user) return _setLoggedinUser(user)
            else return Promise.reject('Invalid login')
        })
}

function signup({ username, password, fullname }) {
    const user = {
        username,
        password,
        fullname,
        likedStations: [],  // Represents stations the user has liked
        likedSongIds: [],   // Represents songs the user has liked
        prefs: { color: 'black', bgColor: 'black' },
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
    return storageService.post(STORAGE_KEY, user)
        .then(_setLoggedinUser)
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
        likedStations: user.likedStations,
        likedSongIds: user.likedSongIds,
        prefs: user.prefs
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
function updateUserPrefs(prefs) {
    const loggedinUser = getLoggedinUser()
    if (!loggedinUser) return Promise.reject('User not logged in')

    // Update the prefs of the logged-in user
    const updatedUser = { ...loggedinUser, prefs }

    return storageService.put(STORAGE_KEY, updatedUser)
        .then(user => {
            _setLoggedinUser(user) // Update sessionStorage as well
            return user
        })
}

/// USER DEMOOOOOOOOOO///////////////////////////////////////////////////////////



const demoUsers = {
    _id: '',
    stations: [
      {
        stationId: '',
        isLiked: true,
        name: '',
        items: []
      }
    ],
    likedStationIds: ['s101', 's102'], // Keeping as is
    likedSongIds: [
      // Adding song IDs from demoStations array
      "CevxZvSJLk8", // Katy Perry song from "Pop Hits"
      "3AtDnEC4zak", // Ed Sheeran song from "Pop Hits"
      "2Vv-BfVoq4g", // Ed Sheeran song from "Pop Hits"
      "1", // AI Experts podcast from "Tech Talks"
      "2", // Blockchain Explained podcast from "Tech Talks"
      "4", // Mental Health lesson from "Health Matters"
      "5"  // Nutrition Basics lesson from "Health Matters"
    ]
  };
