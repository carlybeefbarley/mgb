import SelectedTile from './SelectedTile.js'

// for some reason babel don't want to extend Array.....
export default class TileCollection {
  constructor(...args) {
    Array.call(this, ...args)
  }
}

TileCollection.prototype = Object.create(Array.prototype)

TileCollection.prototype.pushUnique = function(id) {
  if (this.indexOf(id) === -1) {
    return this.push(id)
  }
  return this.length
}

TileCollection.prototype.pushUniquePos = function(tp) {
  for (let i = 0; i < this.length; i++) {
    if (this[i].isEqual(tp)) {
      return this.length
    }
  }
  return this.push(tp)
}
TileCollection.prototype.removeByPos = function(tp) {
  for (let i = 0; i < this.length; i++) {
    if (this[i].isEqual(tp)) {
      this.splice(i, 1)
      break
    }
  }
  return this.length
}

TileCollection.prototype.pushUniquePosOrRemove = function(tp) {
  for (let i = 0; i < this.length; i++) {
    if (this[i].isEqual(tp)) {
      this.splice(i, 1)
      return this.length
    }
  }
  return this.push(tp)
}
TileCollection.prototype.remove = function(tileSelection) {
  const index = this.indexOf(tileSelection)
  if (index > -1) {
    return this.splice(index, 1)
  }
  return null
}
TileCollection.prototype.pushOrRemove = function(tileSelection) {
  const index = this.indexOf(tileSelection)
  if (index === -1) {
    return this.push(tileSelection)
  } else {
    return this.remove(tileSelection)
  }
}

TileCollection.prototype.clear = function() {
  this.length = 0
}

TileCollection.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)]
}

TileCollection.prototype.indexOf = function(another) {
  return this.indexOfGid(another.gid)
}

TileCollection.prototype.indexOfGid = function(gid) {
  let index = -1
  for (let i = 0; i < this.length; i++) {
    if (this[i].gid == gid) {
      index = i
      break
    }
  }
  return index
}
TileCollection.prototype.indexOfId = function(id) {
  let index = -1
  for (let i = 0; i < this.length; i++) {
    if (this[i].id == id) {
      index = i
      break
    }
  }
  return index
}
TileCollection.prototype.debug = function() {
  console.log(this.x, this.y, this.gid)
}
TileCollection.prototype.to2DimArray = function() {
  const ret = []
  for (let i = 0; i < this.length; i++) {
    if (!ret[this[i].y]) {
      ret[this[i].y] = []
    }
    ret[this[i].y][this[i].x] = this[i]
  }

  let shifts = []
  for (let y = 0; y < ret.length; y++) {
    if (!ret[y] || !ret[y].length) {
      ret.shift()
      y--
      continue
    }

    shifts[y] = 0
    for (let x = 0; x < ret[y].length; x++) {
      if (ret[y][x]) {
        break
      }
      shifts[y]++
    }
  }
  const shift = Math.min.apply(Math, shifts)
  for (let y = 0; y < ret.length; y++) {
    ret[y].splice(0, shift)
  }

  return ret
}
