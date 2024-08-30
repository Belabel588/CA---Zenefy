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
  getStationData,
  createStationFromSearch,
}
window.cs = stationService

async function query(filterBy = { txt: '', stationType: '' }) {
  // console.log('FILTER BY INSIDE SERVICE QUERY IS:', filterBy)

  var stations = await storageService.query(STORAGE_KEY)
  // console.log('STATION BEFORE QUERY : ', stations);

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

async function remove(stationId) {
  // throw new Error('Nope')
  await storageService.remove(STORAGE_KEY, stationId)
}

async function save(station) {
  console.log('saving station' , station);
  
  var stationToSave
  let savedStation
  if (station._id) {
    if (station.isLiked) {
      stationToSave = {
        _id: station._id,
        items: station.items,
      }
    } else {
      stationToSave = {
        _id: station._id,
        title: station.title,
        cover: station.cover,
        preview: station.preview,
        items: station.items,
      }
    }
    savedStation = await storageService.put(STORAGE_KEY, stationToSave)
  } else {
    var stations = await storageService.query(STORAGE_KEY)
    const stationToSave = {
      title: station.title || `My playlist #${stations.length}`,
      items: station.items || [],
      cover:
        station.cover ||
        'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2',
      preview: station.preview || '',
      addedAt: station.addedAt || Date.now(),
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

async function getStationData(stationId) {

  const stations = await storageService.query(STORAGE_KEY) 
  const foundStation = stations.find(station => station._id === stationId)

  if (!foundStation) {
    return {
      stationsWithSameType: [],
      combinedTags: []
    }
  }


  const stationsWithSameType = stations.filter(station => station.stationType === foundStation.stationType)
  const combinedTags = stationsWithSameType.map(station => station.tags).flat()

  return {
    stationsWithSameType,
    combinedTags
  }
}


async function createStationFromSearch(searchResults) {
  // Create a new station object
  const station = {
    stationType: 'music', // Assuming the station type is always 'music'
    title: searchResults[0]?.artist || 'Untitled Station', // Use the artist's name as the station title, fallback to 'Untitled Station'
    items: searchResults.map(result => ({
      artist: result.artist,
      id: utilService.makeId(), // Generate a unique ID for each item
      name: result.name,
      album: result.album,
      url: result.url,
      cover: result.cover,
      addedBy: 'user1', // Assuming a default user, replace with actual user ID if available
      likedBy: [], // Empty likedBy array
      addedAt: Date.now() // Current timestamp
    })),
    cover: searchResults[0]?.cover || 'default_cover_url', // Use the first song's cover as the station cover, fallback to a default URL
    tags: [], // Empty tags array
    createdBy: {
      fullname: searchResults[0]?.artist || 'Unknown Artist', // Use the artist's name
      imgUrl: searchResults[0]?.cover || 'default_artist_image_url', // Use the artist's cover as their image, fallback to a default URL
    },
    likedByUsers: [], // Empty likedByUsers array
    addedAt: Date.now() // Current timestamp
  };

  return station;
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
        _id: 'creator1',
        fullname: 'Alice Johnson',
        imgUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      likedByUsers: [],
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
  ]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStations))
}
