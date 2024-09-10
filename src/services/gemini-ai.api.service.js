import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyDvZP4kLVdM-zLNfIHZNgg_swlq2uoMElI'
const API_BASE_URL = 'https://api.gemini-ai.com'

export const geminiApiService = {}

async function fetchGeminiData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data from Gemini AI:', error)
    throw error
  }
}

// Example: Post data using Fetch API
export const postGeminiData = async (endpoint, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error posting data to Gemini AI:', error)
    throw error
  }
}
