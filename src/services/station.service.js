import { storageService } from './async-storage.service'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'
import { updateUser } from '../store/actions/user.actions.js'

const STORAGE_KEY = 'stationDB'

if (!localStorage.getItem(STORAGE_KEY)) {
  _createStations()
}

export const stationService = {
  query,
  getById,
  save,
  remove,
  getEmptyStation,
  getDefaultFilter,
  getItem,
  getItemsStation,
  getStationData,
  createStationFromSearch,
  likeSong,
  getCategoriesWithImages,
}
window.cs = stationService

async function query(filterBy = { txt: '', stationType: '' }) {
  var stations = await storageService.query(STORAGE_KEY)

  const { txt, stationType } = filterBy

  if (txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    stations = stations.filter(
      (station) => regex.test(station.title) || regex.test(station.description)
    )
  }
  if (stationType !== 'all') {
    stations = stations.filter((station) => stationType === station.stationType)
  }

  //   stations = stations.map(({ _id, vendor, price, speed, owner }) => ({
  //     _id,
  //     vendor,
  //     price,
  //     speed,
  //     owner,
  //   }))

  return stations
}

function getById(stationId) {
  return storageService.get(STORAGE_KEY, stationId)
}

async function remove(stationIdToRemove) {
  // throw new Error('Nope')
  try {
    const loggedInUser = userService.getLoggedinUser()
    if (!loggedInUser.likedStationsIds.includes(stationIdToRemove)) return

    await storageService.remove(STORAGE_KEY, stationIdToRemove)

    const newStationsIds = loggedInUser.likedStationsIds.filter(
      (stationId) => stationId !== stationIdToRemove
    )
    const updatedUser = { ...loggedInUser, likedStationsIds: newStationsIds }
    await updateUser(updatedUser)
  } catch (err) {
    console.log(err)
  }
}

async function save(station) {
  const loggedInUser = userService.getLoggedinUser()

  var stationToSave
  let savedStation

  if (station._id) {
    if (!station.isLiked) {
      const likedBy = station.likedByUsers
      // station.likedByUsers.push({
      //   id: loggedInUser._id,
      //   username: loggedInUser.username,
      // })

      stationToSave = {
        _id: station._id,
        title: station.title,
        cover: station.cover,
        preview: station.preview,
        items: station.items,
        // likedByUsers: station.likedByUsers,
      }
    } else {
      stationToSave = station
    }

    savedStation = await storageService.put(STORAGE_KEY, stationToSave)
  } else {
    // var stations = await storageService.query(STORAGE_KEY)
    const stationToSave = {
      title:
        station.title || `My playlist #${loggedInUser.likedStationsIds.length}`,
      items: station.items || [],
      cover:
        station.cover ||
        'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2',
      preview: station.preview || '',
      addedAt: station.addedAt || Date.now(),
      likedByUsers: [{ id: loggedInUser._id, username: loggedInUser.username }],
      // Later, owner is set by the backend
      //   creator: userService.getLoggedinUser(),
    }

    savedStation = await storageService.post(STORAGE_KEY, stationToSave)

    if (!station.isSearched) {
      loggedInUser.likedStationsIds.push(stationToSave._id)

      await updateUser(loggedInUser)
    }
  }
  return savedStation
}

function getEmptyStation() {
  return {
    _id: '',
    title: '',
    items: [{ artist: '', id: '', name: '', url: '', cover: '' }],
    cover:
      'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2',
    addedAt: Date.now(),
  }
}

function getDefaultFilter() {
  return { txt: '', stationType: 'all' }
}

async function getItem(itemId) {
  try {
    var stations = await storageService.query(STORAGE_KEY)
    let item
    stations.map((station) => {
      if (item) return
      item = station.items.find((item) => item.id === itemId)
    })

    return item
  } catch (err) {
    console.log(err)
  }
}

async function getItemsStation(itemId) {
  var stations = await storageService.query(STORAGE_KEY)

  let stationToReturn
  stations.map((station) => {
    // if (stationToReturn) return
    station.items.map((item) => {
      if (item.id === itemId) {
        stationToReturn = station
      }
    })
  })
  return stationToReturn
}

async function getStationData(stationId) {
  const stations = await storageService.query(STORAGE_KEY)
  const foundStation = stations.find((station) => station._id === stationId)

  if (!foundStation) {
    return {
      stationsWithSameType: [],
      combinedTags: [],
    }
  }

  const stationsWithSameType = stations.filter(
    (station) => station.stationType === foundStation.stationType
  )
  const combinedTags = stationsWithSameType
    .map((station) => station.tags)
    .flat()

  return {
    stationsWithSameType,
    combinedTags,
  }
}
async function createStationFromSearch(searchResults, keyWord) {
  // Create a new station object
  const user = userService.getLoggedinUser()
  // if()
  console.log(searchResults)
  const station = {
    keyWord,
    isSearched: true,
    stationType: searchResults.stationType || 'music', // Assuming the station type is always 'music'
    title: searchResults[0]?.artist || 'Untitled Station', // Use the artist's name as the station title, fallback to 'Untitled Station'
    items: searchResults.map((result) => ({
      artist: result.artist,
      id: result.id, // Generate a unique ID for each item
      name: result.name,
      album: result.album,
      url: result.url,
      cover: result.cover,
      addedBy: 'user1', // Assuming a default user, replace with actual user ID if available
      likedBy: [], // Empty likedBy array
      addedAt: Date.now(), // Current timestamp
      lyrics: result.lyrics,
    })),
    cover: searchResults[0]?.cover || 'default_cover_url', // Use the first song's cover as the station cover, fallback to a default URL
    tags: [], // Empty tags array
    createdBy: {
      fullname: searchResults[0]?.artist || 'Unknown Artist', // Use the artist's name
      imgUrl: searchResults[0]?.cover || 'default_artist_image_url', // Use the artist's cover as their image, fallback to a default URL
    },
    likedByUsers: [], // Empty likedByUsers array
    addedAt: Date.now(), // Current timestamp
  }

  return station
}

async function likeSong(itemToAdd) {
  if (itemToAdd.url === '') return
  if (!user) return

  try {
    const user = await userService.getLoggedinUser()
    const stations = await query()
    const likedStation = stations.find(
      (station) => station.isLiked && station.createdBy._id === user._id
    )

    likedStation.items.push(itemToAdd)
    await saveStation(likedStation)
    const likedSongsIds = user.likedSongsIds
    likedSongsIds.push(itemToAdd.id)
    const userToSave = { ...user, likedSongsIds }
    await updateUser(userToSave)
    setLikedStation()
  } catch (err) {
    console.log(err)
  }
}

function _createStations() {
  const demoStations = [
    {
      _id: 'likedSongs123',
      isLiked: true,
      stationType: 'music',
      title: 'Liked Songs',
      items: [
        {
          artist: 'Queen',
          id: 'zoaP5d',
          name: 'Bohemian Rhapsody',
          album: 'A Night at the Opera',
          url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
          cover:
            'https://i1.sndcdn.com/artworks-000116795481-6fmihq-t500x500.jpg',
          addedBy: 'user7',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Led Zeppelin',
          id: 'HJuxQX',
          name: 'Stairway to Heaven',
          album: 'Led Zeppelin IV',
          url: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
          cover:
            'https://i1.sndcdn.com/artworks-000123427250-vyogac-t500x500.jpg',
          addedBy: 'user8',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'The Beatles',
          id: 'aew9tr',
          name: 'Hey Jude',
          album: 'The Beatles Again',
          url: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/0/0a/Heyjudealbum.jpg',
          addedBy: 'user9',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Tame Impala',
          id: 'CT9zn5',
          name: 'Let It Happen',
          album: 'Currents',
          url: 'https://www.youtube.com/watch?v=pFptt7Cargc',
          cover:
            'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79',
          addedBy: 'user1',
          likedBy: [],
          addedAt: 1724685172590,
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
        },
        {
          artist: 'Bruno Mars',
          id: 'ZAZIRK',
          name: 'Uptown Funk',
          album: 'Uptown Special',
          url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
          cover:
            'https://i1.sndcdn.com/artworks-000136214158-87a33w-t500x500.jpg',
          addedBy: 'user12',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Mac DeMarco',
          id: 'G2G3h3',
          name: 'Chamber of Reflection',
          album: 'Salad Days',
          url: 'https://www.youtube.com/watch?v=pQsF3pzOc54',
          cover:
            'https://i.scdn.co/image/ab67616d0000b273ec6e9c13eeed14eedbd5f7c9',
          addedBy: 'user2',
          likedBy: [],
          addedAt: 1724685172590,
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
    },
    {
      _id: 'yPlzCv',
      stationType: 'music',
      title: 'Chill Vibes',
      items: [
        {
          artist: 'Tame Impala',
          id: 'CT9zn5',
          name: 'Let It Happen',
          album: 'Currents',
          url: 'https://www.youtube.com/watch?v=pFptt7Cargc',
          cover:
            'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79',
          addedBy: 'user1',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Mac DeMarco',
          id: 'G2G3h3',
          name: 'Chamber of Reflection',
          album: 'Salad Days',
          url: 'https://www.youtube.com/watch?v=pQsF3pzOc54',
          cover:
            'https://i.scdn.co/image/ab67616d0000b273ec6e9c13eeed14eedbd5f7c9',
          addedBy: 'user2',
          likedBy: [],
          addedAt: 1724685172590,
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
        },
      ],
      cover:
        'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/chill-vibes-compilation-cover-art-design-template-2a73ca5db6f2d1a6606addec54a92e75_screen.jpg?ts=1604916658',
      tags: ['chill', 'relax', 'ambient'],
      createdBy: {
        _id: 'creator1',
        fullname: 'Alice Johnson',
        imgUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: 'UDmm7S',
      stationType: 'music',
      title: 'Upbeat Tunes',
      items: [
        {
          artist: 'Queen',
          id: 'zoaP5d',
          name: 'Bohemian Rhapsody',
          album: 'A Night at the Opera',
          url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
          cover:
            'https://i1.sndcdn.com/artworks-000116795481-6fmihq-t500x500.jpg',
          addedBy: 'user7',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Led Zeppelin',
          id: 'HJuxQX',
          name: 'Stairway to Heaven',
          album: 'Led Zeppelin IV',
          url: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
          cover:
            'https://i1.sndcdn.com/artworks-000123427250-vyogac-t500x500.jpg',
          addedBy: 'user8',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Daft Punk',
          id: 'Qr99dW',
          name: 'Get Lucky',
          album: 'Random Access Memories',
          url: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
          cover: 'https://upload.wikimedia.org/wikipedia/en/7/71/Get_Lucky.jpg',
          addedBy: 'user4',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Calvin Harris',
          id: 'uVqedY',
          name: 'Feel So Close',
          album: '18 Months',
          url: 'https://www.youtube.com/watch?v=dGghkjpNCQ8',
          cover:
            'https://i.scdn.co/image/ab67616d0000b273df3ce26e9ecb1112ae45df37',
          addedBy: 'user5',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Pharrell Williams',
          id: '3aTZbK',
          name: 'Happy',
          album: 'G I R L',
          url: 'https://www.youtube.com/watch?v=y6Sxv-sUYtM',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Pharrell_Williams_-_Happy.jpg/220px-Pharrell_Williams_-_Happy.jpg',
          addedBy: 'user6',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67616d0000b273fe433eeabff7193b5320962c',
      tags: ['upbeat', 'party', 'dance'],
      createdBy: {
        _id: 'creator2',
        fullname: 'Bob Smith',
        imgUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: '0HP0UA',
      stationType: 'music',
      title: 'Rock Classics',
      items: [
        {
          artist: 'Queen',
          id: 'zoaP5d',
          name: 'Bohemian Rhapsody',
          album: 'A Night at the Opera',
          url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
          cover:
            'https://i1.sndcdn.com/artworks-000116795481-6fmihq-t500x500.jpg',
          addedBy: 'user7',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Led Zeppelin',
          id: 'HJuxQX',
          name: 'Stairway to Heaven',
          album: 'Led Zeppelin IV',
          url: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
          cover:
            'https://i1.sndcdn.com/artworks-000123427250-vyogac-t500x500.jpg',
          addedBy: 'user8',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'The Beatles',
          id: 'aew9tr',
          name: 'Hey Jude',
          album: 'The Beatles Again',
          url: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/0/0a/Heyjudealbum.jpg',
          addedBy: 'user9',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67616d0000b273447f8b3ad12080b3fbe51f91',
      tags: ['rock', 'classics', 'legendary'],
      createdBy: {
        _id: 'creator3',
        fullname: 'Charlie Davis',
        imgUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: '0eNciX',
      stationType: 'music',
      title: 'Pop Hits',
      items: [
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
        },
        {
          artist: 'Bruno Mars',
          id: 'ZAZIRK',
          name: 'Uptown Funk',
          album: 'Uptown Special',
          url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
          cover:
            'https://i1.sndcdn.com/artworks-000136214158-87a33w-t500x500.jpg',
          addedBy: 'user12',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover:
        'https://static.qobuz.com/images/covers/sb/yf/txt6suu9pyfsb_600.jpg',
      tags: ['pop', 'hits', 'mainstream'],
      createdBy: {
        _id: 'creator4',
        fullname: 'Diana Evans',
        imgUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: '9F2K2W',
      stationType: 'music',
      title: 'Relax & Unwind',
      items: [
        {
          artist: 'Norah Jones',
          id: 'VOZ2C5',
          name: 'Dont Know Why',
          album: 'Come Away with Me',
          url: 'https://www.youtube.com/watch?v=tO4dxvguQDk',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/Illbeyourbabysingle.jpg/220px-Illbeyourbabysingle.jpg',
          addedBy: 'user13',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Sade',
          id: 'v7D8Or',
          name: 'Smooth Operator',
          album: 'Diamond Life',
          url: 'https://www.youtube.com/watch?v=4TYv2PhG89A',
          cover:
            'https://i1.sndcdn.com/artworks-000578116205-0iurds-t500x500.jpg',
          addedBy: 'user14',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Jack Johnson',
          id: 'S0syJA',
          name: 'Better Together',
          album: 'In Between Dreams',
          url: 'https://www.youtube.com/watch?v=fqxNYjDFJUk',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/f/f6/Better_Together_Luke_Combs.jpg',
          addedBy: 'user15',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPC4yX1R8hpIAkB6KDIYcMJB8Wl7-xWkw9vg&s',
      tags: ['relax', 'unwind', 'calm'],
      createdBy: {
        _id: 'creator5',
        fullname: 'Emma Thompson',
        imgUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: 'PD7mNx',
      stationType: 'podcast',
      title: 'Tech Talk',
      items: [
        {
          artist: 'TED Radio Hour',
          id: 'TRH001',
          name: 'The Next Frontier',
          album: 'TED Radio Hour',
          url: 'https://www.npr.org/programs/ted-radio-hour/',
          cover:
            'https://media.npr.org/assets/img/2020/11/13/ted-radio-hour_tile_npr-network-01_sq-b401b6fafbe93f876e02a8c61c225ec5f8fdd4a3.jpg',
          addedBy: 'user16',
          likedBy: [],
          addedAt: 1724685172591,
        },
        {
          artist: 'Reply All',
          id: 'RA002',
          name: 'The Case of the Missing Hit',
          album: 'Reply All',
          url: 'https://gimletmedia.com/shows/reply-all',
          cover:
            'https://megaphone.imgix.net/podcasts/23d52a2a-1c5f-11ea-9a0e-b70170f2a827/image/uploads_2F1588357113366-jjsdfzx6x4m-c0339c10f9b113a5fcc93436e66e5ef4_2FReplyAll-ShowArt.jpg',
          addedBy: 'user17',
          likedBy: [],
          addedAt: 1724685172592,
        },
        {
          artist: 'Lex Fridman',
          id: 'LF003',
          name: 'Elon Musk: AI, Autopilot, and the Future of Tesla',
          album: 'Lex Fridman Podcast',
          url: 'https://lexfridman.com/podcast/',
          cover:
            'https://lexfridman.com/wordpress/wp-content/uploads/2022/01/thumb_ai_podcast_2022.png',
          addedBy: 'user18',
          likedBy: [],
          addedAt: 1724685172593,
        },
      ],
      cover:
        'https://i.pinimg.com/originals/1c/54/f7/1c54f7b06d7723c21afc5035bf88a5ef.png',
      tags: ['technology', 'innovation', 'science'],
      createdBy: {
        _id: 'creator6',
        fullname: 'Frank Roberts',
        imgUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172594,
    },
    {
      _id: 'PD8kLm',
      stationType: 'podcast',
      title: 'True Crime Stories',
      items: [
        {
          artist: 'Serial',
          id: 'SR001',
          name: 'The Alibi',
          album: 'Serial',
          url: 'https://serialpodcast.org/',
          cover:
            'https://serialpodcast.org/sites/all/modules/custom/serial/img/serial-social-logo.png',
          addedBy: 'user19',
          likedBy: [],
          addedAt: 1724685172595,
        },
        {
          artist: 'My Favorite Murder',
          id: 'MFM002',
          name: 'The Golden State Killer',
          album: 'My Favorite Murder',
          url: 'https://myfavoritemurder.com/',
          cover:
            'https://content.production.cdn.art19.com/images/69/10/10/fb/691010fb-625e-4abe-993c-a57228b28dbe/91cb53ae0d5dbb379b9dffecf0a772593891d0d09bbe6d90ee746edbdb79e3ec75584f2ceb8260e9f675a90c05419b9b99842a76905b686f0f51c1a9d3e227ab.jpeg',
          addedBy: 'user20',
          likedBy: [],
          addedAt: 1724685172596,
        },
        {
          artist: 'Crime Junkie',
          id: 'CJ003',
          name: 'MURDERED: The Watts Family',
          album: 'Crime Junkie',
          url: 'https://crimejunkiepodcast.com/',
          cover:
            'https://content.production.cdn.art19.com/images/cc/e5/0a/08/cce50a08-d77d-490e-8c68-17725541b0ca/9dcebd4019d57b9551799479fa226e2a79026be3c2857ce6bbc8a36cf1a153a9638f9a5a08f40840ffa02ef628f9f4a29460461fe8923ff9508e20f8924e15b9.jpeg',
          addedBy: 'user21',
          likedBy: [],
          addedAt: 1724685172597,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67706c0000bebb801c4d00f11a7f867d7abf3a',
      tags: ['true crime', 'mystery', 'investigation'],
      createdBy: {
        _id: 'creator7',
        fullname: 'Grace Lee',
        imgUrl: 'https://randomuser.me/api/portraits/women/7.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172598,
    },
    {
      _id: 'PD9pQr',
      stationType: 'podcast',
      title: 'Comedy Hour',
      items: [
        {
          artist: 'Conan O Brien',
          id: 'CO001',
          name: 'Will Ferrell',
          album: 'Conan O Brien Needs A Friend',
          url: 'https://www.earwolf.com/show/conan-obrien/',
          cover:
            'https://content.production.cdn.art19.com/images/5d/4f/d2/19/5d4fd219-85cc-4f03-bf7a-bb4de4551b8d/8d9e6ebc4d65a9575fa626318e426fcf8be7f98ea0c1b7b103de2b32def46ded57537627ad114ee194cdb857931458c47dbe1c14db5282397e1bf7a3fdbf836d.png',
          addedBy: 'user22',
          likedBy: [],
          addedAt: 1724685172599,
        },
        {
          artist: 'Marc Maron',
          id: 'WTF002',
          name: 'Robin Williams',
          album: 'WTF with Marc Maron',
          url: 'http://www.wtfpod.com/',
          cover:
            'https://i.scdn.co/image/d3bc5a53ac4ed94b7b0bfb8b2cfb3c39a58cc864',
          addedBy: 'user23',
          likedBy: [],
          addedAt: 1724685172600,
        },
        {
          artist: 'Joe Rogan',
          id: 'JRE003',
          name: 'Dave Chappelle',
          album: 'The Joe Rogan Experience',
          url: 'https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk',
          cover:
            'https://i.scdn.co/image/ab6765630000ba8a1ddfa03938f377ab9f685ee2',
          addedBy: 'user24',
          likedBy: [],
          addedAt: 1724685172601,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67706c0000bebb7ef04e9d791394fe8076e98b',
      tags: ['comedy', 'humor', 'talk show'],
      createdBy: {
        _id: 'creator8',
        fullname: 'Henry Wilson',
        imgUrl: 'https://randomuser.me/api/portraits/men/8.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172602,
    },
    {
      _id: 'oPq12X',
      stationType: 'music',
      title: 'Hip-Hop Essentials',
      items: [
        {
          artist: 'Kendrick Lamar',
          id: 'kLmr1',
          name: 'HUMBLE.',
          album: 'DAMN.',
          url: 'https://www.youtube.com/watch?v=tvTRZJ-4EyI',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png',
          addedBy: 'user16',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Drake',
          id: 'Dr3ke',
          name: "God's Plan",
          album: 'Scorpion',
          url: 'https://www.youtube.com/watch?v=xpVfcZ0ZcFM',
          cover:
            'https://cdns-images.dzcdn.net/images/cover/b69d3bcbd130ad4cc9259de543889e30/500x500.jpg',
          addedBy: 'user17',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'J. Cole',
          id: 'jC0le',
          name: 'No Role Modelz',
          album: '2014 Forest Hills Drive',
          url: 'https://www.youtube.com/watch?v=a_426RiwST8',
          cover:
            'https://cdns-images.dzcdn.net/images/cover/f45c8916970597d390313833a9db0c61/1900x1900-000000-80-0-0.jpg',
          addedBy: 'user18',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67616d0000b273b74634bdd01a919a4fc55c47',
      tags: ['hip-hop', 'rap', 'essentials'],
      createdBy: {
        id: 'creator6',
        fullname: 'Michael Brown',
        imgUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: 'zWyX45',
      stationType: 'music',
      title: 'Indie Anthems',
      items: [
        {
          artist: 'Arctic Monkeys',
          id: 'AM1',
          name: 'Do I Wanna Know?',
          album: 'AM',
          url: 'https://www.youtube.com/watch?v=bpOSxM0rNPM',
          cover:
            'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163',
          addedBy: 'user19',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'The Strokes',
          id: 'Strks1',
          name: 'Last Nite',
          album: 'Is This It',
          url: 'https://www.youtube.com/watch?v=TOypSnKFHrE',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/The_Strokes_-_Last_Nite_-_CD_single_cover.jpg/220px-The_Strokes_-_Last_Nite_-_CD_single_cover.jpg',
          addedBy: 'user20',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Florence + The Machine',
          id: 'Flor1',
          name: 'Dog Days Are Over',
          album: 'Lungs',
          url: 'https://www.youtube.com/watch?v=iWOyfLBYtuU',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/7/75/DogDaysAreOver_F%26M.jpg',
          addedBy: 'user21',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67616d0000b27302bca0044fec426aad27994e',
      tags: ['indie', 'alternative', 'rock'],
      createdBy: {
        id: 'creator7',
        fullname: 'Sophie Williams',
        imgUrl: 'https://randomuser.me/api/portraits/women/7.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: 'uWq9bH',
      stationType: 'music',
      title: 'Jazz Vibes',
      items: [
        {
          artist: 'Miles Davis',
          id: 'MDav1',
          name: 'So What',
          album: 'Kind of Blue',
          url: 'https://www.youtube.com/watch?v=zqNTltOGh5c',
          cover:
            'https://upload.wikimedia.org/wikipedia/commons/a/ad/Kind_of_Blue_%281959%2C_CL_1355%29_album_cover.jpg',
          addedBy: 'user22',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'John Coltrane',
          id: 'JCol1',
          name: 'Giant Steps',
          album: 'Giant Steps',
          url: 'https://www.youtube.com/watch?v=30FTr6G53VU',
          cover:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTXvkpQ6BJbL_GvvrOhBodXAyGZoiiswgRTA&s',
          addedBy: 'user23',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Nina Simone',
          id: 'NSim1',
          name: 'Feeling Good',
          album: 'I Put a Spell on You',
          url: 'https://www.youtube.com/watch?v=D5Y11hwjMNs',
          cover:
            'https://static.qobuz.com/images/covers/ca/52/svr1g4hww52ca_600.jpg',
          addedBy: 'user24',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67616d00001e024ca1ccb2b20f47b9eb5fc3bc',
      tags: ['jazz', 'blues', 'classic'],
      createdBy: {
        id: 'creator8',
        fullname: 'Ella Fitzgerald',
        imgUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: 'pTm8bV',
      stationType: 'music',
      title: 'Electronic Beats',
      items: [
        {
          artist: 'Daft Punk',
          id: 'DPunk1',
          name: 'One More Time',
          album: 'Discovery',
          url: 'https://www.youtube.com/watch?v=FGBhQbmPwH8',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/b/bb/Blink-182_One_More_Time_album_cover.jpeg',
          addedBy: 'user25',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'The Chemical Brothers',
          id: 'TCB1',
          name: 'Galvanize',
          album: 'Push the Button',
          url: 'https://www.youtube.com/watch?v=H2hzVV2Nwfs',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/b/b1/The_Chemical_Brothers_-_Galvanize.png',
          addedBy: 'user26',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Deadmau5',
          id: 'Dmau5',
          name: "Ghosts 'n' Stuff",
          album: 'For Lack of a Better Name',
          url: 'https://www.youtube.com/watch?v=h7ArUgxtlJs',
          cover:
            'https://upload.wikimedia.org/wikipedia/en/d/d2/Deadmau5_and_Rob_Swire_-_Ghosts_N_Stuff_cover_art.jpg',
          addedBy: 'user27',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67616d00001e026a47a99d4cd598061c7520b0',
      tags: ['electronic', 'dance', 'beats'],
      createdBy: {
        id: 'creator9',
        fullname: 'Liam Carter',
        imgUrl: 'https://randomuser.me/api/portraits/men/9.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
    {
      _id: 'hU8zWd',
      stationType: 'music',
      title: 'Classical Greats',
      items: [
        {
          artist: 'Ludwig van Beethoven',
          id: 'LvBe1',
          name: 'Symphony No. 9',
          album: 'Symphony No. 9',
          url: 'https://www.youtube.com/watch?v=t3217H8JppI',
          cover:
            'https://d10nlcvbt35ur0.cloudfront.net/content/uploads/2021/01/04123735/FR-741Cover.jpg',
          addedBy: 'user28',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Wolfgang Amadeus Mozart',
          id: 'WAm1',
          name: 'Eine kleine Nachtmusik',
          album: 'Eine kleine Nachtmusik',
          url: 'https://www.youtube.com/watch?v=o1FSN8_pp_o',
          cover:
            'https://i.scdn.co/image/ab67616d0000b27325cd7dfef168e72ac4555a1c',
          addedBy: 'user29',
          likedBy: [],
          addedAt: 1724685172590,
        },
        {
          artist: 'Johann Sebastian Bach',
          id: 'JSB1',
          name: 'Brandenburg Concerto No. 3',
          album: 'Brandenburg Concertos',
          url: 'https://www.youtube.com/watch?v=pdsyNwUoON0',
          cover:
            'https://i.scdn.co/image/ab67616d0000b2739eafda259f1a35423b3be6ab',
          addedBy: 'user30',
          likedBy: [],
          addedAt: 1724685172590,
        },
      ],
      cover: 'https://i.scdn.co/image/ab67616d0000b273bd1b3e912d06b240bd8c5ca0',
      tags: ['classical', 'orchestra', 'greats'],
      createdBy: {
        id: 'creator10',
        fullname: 'George Smith',
        imgUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
      },
      likedByUsers: [],
      addedAt: 1724685172590,
    },
  ]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStations))
}

// Function to get categories with their corresponding images
function getCategoriesWithImages() {
  const categories = [
    'Podcasts',
    'Made for you',
    'New releases',
    'Pop',
    'Hip-Hop',
    'Rock',
    'Latin',
    'Educational',
    'Documentary',
    'Comedy',
    'Dance Electric',
    'Mood',
    'Indie',
    'Workout',
    'Discover',
    'Country',
    'R&B',
    'K-pop',
    'Chill',
    'Sleep',
    'Party',
    'At home',
    'Love',
    'Metal',
    'Jazz',
    'Trending',
    'Anime',
    'Gaming',
    'Folk & Acoustic',
    'Focus',
    'Kids & Family',
    'Classical',
    'Instrumental',
    'Punk',
    'Ambient',
    'Blues',
    'Afro',
    'Funk & Disco',
    'Summer',
    'EQUAL',
  ]

  // Assuming the images are located in a folder named 'assets/images' in your project
  const categoryImages = categories.map(
    (category) =>
      `../../../public/spotify-pics/${category
        .toLowerCase()
        .replace(/ & /g, '-')
        .replace(/ /g, '-')}.png`
  )

  // Return an array of objects combining category names and their images
  return categories.map((category, index) => ({
    category,
    image: categoryImages[index],
  }))
}

export default getCategoriesWithImages
