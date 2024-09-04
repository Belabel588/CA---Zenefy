import { httpService } from './http.service.js'
import { utilService } from './util.service.js'
import { stationService } from './station.service.js'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

export const userService = {
  login,
  logout,
  signup,
  getUsers,
  getById,
  remove,
  update,
  getLoggedinUser,
  saveLoggedinUser,
  query,
  getEmptyCredentials,
  updateUser,
  guestLogin,
}

function getUsers() {
  return httpService.get(`user`)
}

async function getById(userId) {
  console.log(userId)
  const user = await httpService.get(`user/${userId}`)
  return user
}

function remove(userId) {
  return httpService.delete(`user/${userId}`)
}

async function update({ _id, score }) {
  const user = await httpService.put(`user/${_id}`, { _id, score })

  // When admin updates other user's details, do not update loggedinUser
  const loggedinUser = getLoggedinUser() // Might not work because its defined in the main service???
  if (loggedinUser._id === user._id) saveLoggedinUser(user)

  return user
}

async function login(userCred) {
  const user = await httpService.post('auth/login', userCred)
  if (user) return saveLoggedinUser(user)
}

async function signup(userCred) {
  if (!userCred.imgUrl)
    userCred.imgUrl =
      'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

  const likedUserId = utilService.generateObjectId()
  const { username, password, fullname } = userCred
  const user = {
    username,
    password,
    fullname,
    likedStationsIds: [likedUserId],
    likedSongsIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const savedUser = await httpService.post('auth/signup', user)

  const userLikedStation = {
    _id: likedUserId,
    isLiked: true,
    stationType: 'music',
    title: 'Liked Songs',
    items: [],
    cover: 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
    tags: [],
    createdBy: {
      _id: savedUser._id,
      fullname,
      imgUrl: '',
    },
    likedByUsers: [{ fullname, id: savedUser._id }],
    addedAt: Date.now(),
  }

  await httpService.post('station', userLikedStation)

  return saveLoggedinUser(savedUser)
}

async function logout() {
  sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
  return await httpService.post('auth/logout')
}

function getLoggedinUser() {
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}

function saveLoggedinUser(user) {
  const userToSave = {
    _id: user._id,
    fullname: user.fullname,
    likedStationsIds: user.likedStationsIds,
    likedSongsIds: user.likedSongsIds,
  }
  sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(userToSave))
  return userToSave
}

function query() {
  return httpService.get(STORAGE_KEY)
}

function getEmptyCredentials() {
  return {
    fullname: '',
    username: '',
    password: '',
  }
}

async function updateUser(updatedUser) {
  const loggedinUser = getLoggedinUser()
  if (!loggedinUser) return Promise.reject('User not logged in')

  const savedUser = await httpService.put(
    `user/${updatedUser._id}`,
    updatedUser
  )

  return saveLoggedinUser(savedUser)
}

async function guestLogin() {
  try {
    // 35675e68f4b5af7b995d9205 = mongo guest id
    const guest = await getById('35675e68f4b5af7b995d9205')
    console.log(guest)
    return guest
  } catch (err) {
    console.log(err)
  }
}
