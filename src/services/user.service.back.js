import { httpService } from './http.service.js'

const BASE_URL = 'auth/'
const STORAGE_KEY_LOGGEDIN = 'loggedinUser'

export const userService = {
    login,
    logout,
    signup,
    getById,
    getLoggedinUser,
    updateLikedSongs,
    getEmptyCredentials
}

async function login({ username, password }) {
    try {
        const user = await httpService.post(`${BASE_URL}login`, { username, password })
        if (user) return _setLoggedinUser(user)
        else throw new Error('Invalid login')
    } catch (err) {
        return Promise.reject(err.message)
    }
}

async function signup({ username, password, fullname }) {
    const user = { 
        username, 
        password, 
        fullname, 
        likedStations: [], // Represents stations the user has liked
        likedSongIds: [],  // Represents songs the user has liked
        isAdmin: false
    }
    try {
        const newUser = await httpService.post(`${BASE_URL}signup`, user)
        if (newUser) return _setLoggedinUser(newUser)
        else throw new Error('Invalid signup')
    } catch (err) {
        return Promise.reject(err.message)
    }
}

async function logout() {
    try {
        await httpService.post(`${BASE_URL}logout`)
        sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
    } catch (err) {
        return Promise.reject('Logout failed')
    }
}

async function updateLikedSongs(songId, action) {
    const loggedinUser = getLoggedinUser()
    if (!loggedinUser) return Promise.reject('User not logged in')

    let likedSongIds = loggedinUser.likedSongIds || []
    if (action === 'add') {
        likedSongIds.push(songId)
    } else if (action === 'remove') {
        likedSongIds = likedSongIds.filter(id => id !== songId)
    }

    try {
        const updatedUser = await httpService.put(`user/${loggedinUser._id}`, { likedSongIds })
        _setLoggedinUser(updatedUser)
        return updatedUser
    } catch (err) {
        return Promise.reject('Failed to update liked songs')
    }
}

async function getById(userId) {
    try {
        const user = await httpService.get(`user/${userId}`)
        return user
    } catch (err) {
        return Promise.reject('User not found')
    }
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN))
}

function _setLoggedinUser(user) {
    const userToSave = { 
        _id: user._id, 
        fullname: user.fullname, 
        likedStations: user.likedStations || [], 
        likedSongIds: user.likedSongIds || [] 
    }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN, JSON.stringify(userToSave))
    return userToSave
}

function getEmptyCredentials() {
    return {
        username: '',
        password: '',
        fullname: ''
    }
}
