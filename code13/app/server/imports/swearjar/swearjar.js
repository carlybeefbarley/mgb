// swearjar-node

import badWords from './config/profanity.json'

var path = require('path')

const swearjar = {
  _badWords: badWords,

  scan(text, callback) {
    var word, key, match
    var regex = /\w+/g

    while ((match = regex.exec(text))) {
      word = match[0]
      key = word.toLowerCase()

      if (key in this._badWords && Array.isArray(this._badWords[key])) {
        if (callback(word, match.index, this._badWords[key]) === false) {
          break
        }
      }
    }
  },

  profane(text) {
    var profane = false

    this.scan(text, function(word, index, categories) {
      profane = true
      return false // Stop on first match
    })

    return profane
  },

  scorecard(text) {
    var scorecard = {}

    this.scan(text, function(word, index, categories) {
      for (let i = 0; i < categories.length; i += 1) {
        var cat = categories[i]

        if (cat in scorecard) {
          scorecard[cat] += 1
        } else {
          scorecard[cat] = 1
        }
      }
    })

    return scorecard
  },

  censor(text) {
    var censored = text

    this.scan(text, function(word, index, categories) {
      censored = censored.substr(0, index) + word.replace(/\S/g, '*') + censored.substr(index + word.length)
    })

    return censored
  },

  loadBadWords(relativePath) {
    var basePath = path.dirname(module.parent.filename)
    var fullPath = path.join(basePath, relativePath)
    this._badWords = require(fullPath)
  },

  setBadWords(badWords) {
    this._badWords = badWords || {}
  },
}

export default swearjar
