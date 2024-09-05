import Axios from 'axios'

const BASE_URL =
  process.env.NODE_ENV === 'production' ? '/api/' : '//localhost:3030/api/'

const axios = Axios.create({ withCredentials: true })

export const httpService = {
  async get(endpoint, data) {
    return await ajax(endpoint, 'GET', data)
  },
  async post(endpoint, data) {
    return await ajax(endpoint, 'POST', data)
  },
  async put(endpoint, data) {
    return await ajax(endpoint, 'PUT', data)
  },
  async delete(endpoint, data) {
    return await ajax(endpoint, 'DELETE', data)
  },
}

async function ajax(endpoint, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`
  const params = method === 'GET' ? data : null

  const options = { url, method, data, params }
  // console.log(options)
  try {
    const res = await axios(options)
    // console.log(res)
    return res.data
  } catch (err) {
    console.log(
      `Had Issues ${method}ing to the backend, endpoint: ${endpoint}, with data: `,
      data
    )
    console.dir(err)
    if (err.response && err.response.status === 401) {
      sessionStorage.clear()
      window.location.assign('/')
    }
    throw err
  }
}
