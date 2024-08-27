import { storageService } from './async-storage.service'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'

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
}
window.cs = stationService

async function query(filterBy = { txt: '', price: 0 }) {
  var stations = await storageService.query(STORAGE_KEY)
  const { txt } = filterBy

  if (txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    stations = stations.filter(
      (station) => regex.test(station.title) || regex.test(station.description)
    )
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

async function remove(stationId) {
  // throw new Error('Nope')
  await storageService.remove(STORAGE_KEY, stationId)
}

async function save(station) {
  var savedStation
  if (station._id) {
    const stationToSave = {
      _id: station._id,
      title: station.title,
    }
    savedStation = await storageService.put(STORAGE_KEY, stationToSave)
  } else {
    const stationToSave = {
      title: station.title,
      // Later, owner is set by the backend
      //   creator: userService.getLoggedinUser(),
    }
    savedStation = await storageService.post(STORAGE_KEY, stationToSave)
  }
  return savedStation
}

function getEmptyStation() {
  return {
    _id: '',
    title: '',
    items: [{ artist: '', id: '', name: '', url: '', cover: '' }],
    cover: '',
    addedAt: Date.now(),
  }
}

function getDefaultFilter() {
  return { txt: '' }
}

async function getItem(itemId) {
  try {
    const stations = await stationService.query()
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
  console.log(stations)
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

function _createStations() {
  const demoStations = [
    {
      _id: 'yPlzCv',
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
      title: 'Upbeat Tunes',
      items: [
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
      title: 'Relax & Unwind',
      items: [
        {
          artist: 'Norah Jones',
          id: 'VOZ2C5',
          name: 'Don’t Know Why',
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
  ]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStations))
}
