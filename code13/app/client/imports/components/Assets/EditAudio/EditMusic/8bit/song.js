import _ from 'lodash'
import React, { PropTypes } from 'react'
import { GetFreq } from './instruments'

import { PianoInstrument, NoiseInstrument, SinWaveInstrument } from './instruments.js'

function Song(bassParams, pianoParams) {
  this.Channels = []
  this.bars = 4
  this.secperbar = 4

  this.piano = {
    //time, pitch (0-1), note start, note end
    name: 'piano',
    generator(t, p, s, e) {
      var freq = GetFreq(p * 88)
      var vol = Math.pow(1 - (t - s) / (e - s), 0.25)
      return (t % freq) / freq * vol
    },
  }

  this.addChannels = function() {
    var pianoInstrument = new PianoInstrument(pianoParams)
    this.addChannel(pianoInstrument)
    this.addChannel(new NoiseInstrument())
    var sinInstrument = new SinWaveInstrument(pianoInstrument.beatNotes, bassParams)
    this.addChannel(sinInstrument)

    // this.Channels[2].notes = []
    // this.Channels[1].notes = []
  }

  this.addChannel = function(instrument) {
    var id = this.Channels.length
    this.Channels.push({
      id,
      instrument,
      vol: 1,
      notes: instrument.notes ? instrument.notes : [],
      name: id + ' : ' + instrument.name,
    })
  }

  this.addChannels()
}

export default Song
