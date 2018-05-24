var sampleRate = 44100

// ##################### piano instrument ########################
function PianoInstrument(params) {
  this.name = 'piano'
  this.notes = []
  this.beatNotes = []

  this.generator = function(t, p, s, e) {
    var freq = GetFreq(p * 88)
    var vol = Math.pow(1 - (t - s) / (e - s), 0.25)
    return (t % freq) / freq * vol
  }

  this.addNote = function(channel, key, start, end, vol) {
    this.notes.push({
      channel,
      key,
      start,
      end,
      vol: vol ? vol : -1,
    })
  }

  this.generateNotes = function() {
    var self = this

    // var v = Math.floor(Math.random()*4)-2;
    // var v1 = Math.floor(Math.random()*20)-10;
    // var v2 = Math.floor(Math.random()*20)-10;
    // var v3 = Math.floor(Math.random()*20)-10;
    // var vv = Math.floor(Math.random()*2)+3;

    var v = params.v
    var v1 = params.v1
    var v2 = params.v2
    var v3 = params.v3
    var vv = params.vv

    var s = params.melodyNoteCount

    for (let i = 0; i < s * 2; i++) {
      let delay = (Math.random() < 0.4) * (Math.floor(Math.random() * 3) * (1 / 2))
      delay = (Math.random() < params.delay) * (Math.floor(Math.random() * 3) * (1 / 4))
      if (Math.random() > params.noteProbability)
        this.addNote(
          0,
          49 -
            12 +
            Math.floor(Math.random() * 3) * 12 -
            12 +
            v +
            0 * (Math.floor(Math.pow(Math.random(), 2) * 3) * 2 - 2) -
            vv * (Math.random() < 0.2),
          i / s + delay / s,
          i / s + 1 / s + delay / s,
        )
    }

    clone(this.notes).forEach(function(note, i) {
      self.addNote(0, note.key + v1, note.start + 2, note.end + 2)
      self.addNote(0, note.key + v2, note.start + 4, note.end + 4)
      self.addNote(0, note.key + v3, note.start + 6, note.end + 6)
    })
    this.addNote(0, 49 + v, 0, 2, 0.5)
    this.addNote(0, 49 + v + v1, 2, 4, 0.5)
    this.addNote(0, 49 + v + v2, 4, 6, 0.5)
    this.addNote(0, 49 + v + v3, 6, 8, 0.5)

    clone(this.notes).forEach(function(note, i) {
      let p
      if (note.start < 2) p = 49 + v
      else if (note.start < 4) p = 49 + v + v1
      else if (note.start < 6) p = 49 + v + v2
      else if (note.start < 8) p = 49 + v + v3
      if (Math.random() > 0.5) {
        p -= vv
        if (Math.random() > 0.5) p -= 3
      }
      p -= 12

      // TODO add this to sin wave channel (2)
      if (Math.random() > 0.5) self.beatNotes.push(new Note(2, p, note.start, note.end, note.vol / 2))
    })

    clone(this.notes).forEach(function(note, i) {
      //duplicate everything to a second bar
      self.addNote(0, note.key, note.start + 8, note.end + 8, note.vol)
      if (params.enchance) self.addNote(0, note.key + 12, note.start + 8, note.end + 0.375 + 8, note.vol / 2)
    })
  }

  this.generateNotes()
}

// ###################### noise instrument #############################
function NoiseInstrument() {
  this.name = 'noise'
  this.notes = []

  this.generator = function(t, p, s, e) {
    var freq = GetFreq((1 - p) * 88 + 12)
    var vol = Math.pow(1 - (t - s) / (e - s), 2) * (0.5 + 0.5 * ((t % freq) / freq))
    return Math.random() * vol
  }

  this.addNote = function(channel, key, start, end, vol) {
    this.notes.push({
      channel,
      key,
      start,
      end,
      vol: vol ? vol : -1,
    })
  }

  this.generateNotes = function() {
    //drum beat
    for (let i = 0; i < 8; i += 2) {
      this.addNote(1, 49, i, i + 1 / 8)
      this.addNote(1, 49, i + 1 / 4, i + 1 / 4 + 1 / 16)
      this.addNote(1, 49, i + 1 / 2, i + 1 / 2 + 1 / 4)
      this.addNote(1, 49, i + 3 / 4, i + 3 / 4 + 1 / 16)
      this.addNote(1, 49, i + 7 / 8, i + 7 / 8 + 1 / 8)
      this.addNote(1, 49, i + 1 + 1 / 8, i + 1 + 1 / 8 + 1 / 8)
      this.addNote(1, 49, i + 1 + 1 / 4, i + 1 + 1 / 4 + 1 / 16)
      this.addNote(1, 49, i + 1 + 1 / 2, i + 1 + 1 / 2 + 1 / 4)
      this.addNote(1, 49, i + 1 + 3 / 4, i + 1 + 3 / 4 + 1 / 16)
      this.addNote(1, 49, i + 1 + 7 / 8, i + 1 + 7 / 8 + 1 / 16)
    }

    var self = this
    var tmpNotes = clone(this.notes)
    tmpNotes.forEach(function(note, i) {
      //duplicate everything to a second bar
      self.addNote(1, note.key, note.start + 8, note.end + 8, note.vol)
    })

    for (let i = 8; i < 16; i += 0.5) {
      //more hit-hat on the second bar
      this.addNote(1, 49 - 24, i + 1 / 4, i + 1 / 4 + 1 / 8, 2)
    }

    this.addNote(1, 49 - 12, 8, 8 + 2, 0.5) //cymbal crash
  }

  this.generateNotes()
}

// ################# sinwave instrument #########################
function SinWaveInstrument(beatNotes, params) {
  this.name = 'sin wave'
  this.notes = beatNotes
  // console.log(beatNotes)

  this.generator = function(t, p, s, e) {
    var freq = GetFreq((1 - p) * 88 - 3.75)
    var vol = Math.pow(1 - (t - s) / (e - s), 1)
    return Math.sin(((t * freq) % sampleRate) / sampleRate * Math.PI * 2) * vol
  }

  this.addNote = function(channel, key, start, end, vol) {
    this.notes.push({
      channel,
      key,
      start,
      end,
      vol: vol ? vol : -1,
    })
  }

  this.generateNotes = function() {
    var v = Math.floor(Math.random() * 4) - 2

    if (params.isBass) {
      for (let i = 8; i < 16; i += 0.5) {
        //more hit-hat on the second bar
        this.addNote(2, 65, i, i + 1 / 8, params.bassVolume) //plus some beat
      }
    }
  }

  this.generateNotes()
}

function Note(channel, key, start, end, vol) {
  return {
    channel,
    key,
    start,
    end,
    vol: vol ? vol : -1,
  }
}

export function GetFreq(key) {
  return Math.pow(Math.pow(2, 1 / 12), key - 49) * 440
} //A key of 49 corresponds to a frequency of 440.

function clone(obj) {
  if (null == obj || 'object' != typeof obj) return obj
  var copy = obj.constructor()
  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]
  }
  return copy
}

export { PianoInstrument, NoiseInstrument, SinWaveInstrument }
