async function likeSong(itemToLike) {
  if (itemToLike.url === '') return
  if (!user) return

  const likedStation = stations.find(
    (station) => station.isLiked && station.createdBy._id === user._id
  )
  const likedSongsIds = user.likedSongsIds
  if (user.likedSongsIds.includes(itemToLike.id)) {
    const idx = likedStation.items.findIndex(
      (item) => item.id === itemToLike.id
    )
    likedStation.items.splice(idx, 1)
    const songIdx = likedSongsIds.findIndex((id) => id === itemToLike.id)
    likedSongsIds.splice(songIdx, 1)
  } else {
    const newItem = { ...itemToLike, addedAt: new Date() }

    likedStation.items.push(newItem)
    likedSongsIds.push(itemToLike.id)
  }

  try {
    const saved = await saveStation(likedStation)

    const userToSave = { ...user, likedSongsIds }
    await updateUser(userToSave)

    onSetLikedStation()
  } catch (err) {
    console.log(err)
  }
}
