import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.GEMINI_API
const API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta2/models/{model}:generate'

export const geminiApiService = {
  generate,
}

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

async function generate(category) {
  try {
    const json = JSON.stringify(station)
    const prompt = `Generate an array of 5 unique song names based on the user's input: "${category}". The input might be a song name, a phrase, a category, an artist name, or anything that comes to mind. Respond in JSON format as an array of strings, with no additional text or explanation. Ensure that each response contains different song names from previous calls.`

    const result = await model.generateContent(prompt)
    let stringifyArray = result.response.text()
    // console.log(stringifyArray)
    // let edited = stringifyArray.slice(7)
    // console.log(edited)
    // let finalStringify = edited.slice(0, edited.length - 6)
    // console.log(finalStringify)

    const array = JSON.parse(stringifyArray)

    return array
  } catch (err) {
    console.log(err)
  }
}

const station = {
  _id: '940382hd8sn47dirm68ens30',
  isLiked: false,
  stationType: 'music',
  title: 'Liked Songs',
  items: [
    {
      artist: 'Queen',
      id: 'zoaP5d',
      name: 'Bohemian Rhapsody',
      album: 'A Night at the Opera',
      url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      cover: 'https://i1.sndcdn.com/artworks-000116795481-6fmihq-t500x500.jpg',
      addedBy: 'user7',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '05:59',
    },
    {
      artist: 'Led Zeppelin',
      id: 'HJuxQX',
      name: 'Stairway to Heaven',
      album: 'Led Zeppelin IV',
      url: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
      cover: 'https://i1.sndcdn.com/artworks-000123427250-vyogac-t500x500.jpg',
      addedBy: 'user8',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '08:02',
    },
    {
      artist: 'The Beatles',
      id: 'aew9tr',
      name: 'Hey Jude',
      album: 'The Beatles Again',
      url: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
      cover: 'https://upload.wikimedia.org/wikipedia/en/0/0a/Heyjudealbum.jpg',
      addedBy: 'user9',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '08:09',
    },
    {
      artist: 'Tame Impala',
      id: 'CT9zn5',
      name: 'Let It Happen',
      album: 'Currents',
      url: 'https://www.youtube.com/watch?v=pFptt7Cargc',
      cover: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79',
      addedBy: 'user1',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '04:16',
    },
    {
      artist: 'Taylor Swift',
      id: '3J9rjg',
      name: 'Shake It Off',
      album: '1989',
      url: 'https://www.youtube.com/watch?v=nfWlot6h_JM',
      cover:
        'https://pyxis.nymag.com/v1/imgs/2d9/6f5/3f8dbd63613637b7843e4653ff548503b9-tay--.w710.jpg',
      addedBy: 'user10',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '04:01',
    },
    {
      artist: 'Adele',
      id: '9je28A',
      name: 'Rolling in the Deep',
      album: '21',
      url: 'https://www.youtube.com/watch?v=rYEDA3JcQqw',
      cover:
        'https://cdns-images.dzcdn.net/images/cover/8bdaf37e2e7f883e84bbc3462c938293/500x500.jpg',
      addedBy: 'user11',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '03:48',
    },
    {
      artist: 'Bruno Mars',
      id: 'ZAZIRK',
      name: 'Uptown Funk',
      album: 'Uptown Special',
      url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
      cover: 'https://i1.sndcdn.com/artworks-000136214158-87a33w-t500x500.jpg',
      addedBy: 'user12',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '04:31',
    },
    {
      artist: 'Mac DeMarco',
      id: 'G2G3h3',
      name: 'Chamber of Reflection',
      album: 'Salad Days',
      url: 'https://www.youtube.com/watch?v=pQsF3pzOc54',
      cover: 'https://i.scdn.co/image/ab67616d0000b273ec6e9c13eeed14eedbd5f7c9',
      addedBy: 'user2',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '03:52',
    },
    {
      artist: 'Toro y Moi',
      id: 'JX6Dy3',
      name: 'So Many Details',
      album: 'Anything in Return',
      url: 'https://www.youtube.com/watch?v=O0_ardwzTrA',
      cover: 'https://i1.sndcdn.com/artworks-vffRvS0dZpkD-0-t500x500.jpg',
      addedBy: 'user3',
      likedBy: [],
      addedAt: 1724685172590,
      duration: '04:25',
    },
  ],
  cover: 'https://misc.scdn.co/liked-songs/liked-songs-640.png', // Spotify's Liked Songs cover
  tags: ['favorites', 'liked', 'personal'],
  createdBy: {
    _id: 'guest',
    fullname: 'Guest',
  },
  likedByUsers: [{ fullname: 'Guest', id: 'guest' }],
  addedAt: 1724685172590,
}
