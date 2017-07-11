import { NoteEvent, ProgramChangeEvent, Track, Writer } from './MidiWriter'

// import { initialState as configInitialState } from '../reducers/config';

import { compose, roundToXPlaces } from './tools'

const convertBPMtoMidi = bpm => bpm / 60 * 250

const getMidiDataFromHitTypes = (sounds, hitTypes) =>
  hitTypes.map((hitType, i) => sounds.find(s => s.id === hitType).midi)

const convertBeatLengthToMidiDuration = beatLength => 4 / (beatLength * 4)

const removeXDecimalPlaceWithoutRounding = (value, x) =>
  value.toString().split('.')[1] ? parseFloat(value.toString().slice(0, -x)) : value

const getTrackFromInstrument = (midiData, sequence, channel) => {
  const durations = sequence.map((beat, i) => convertBeatLengthToMidiDuration(beat.beat))

  let currentWaitTime = 0
  return durations.reduce((newArr, duration, i) => {
    const volume = sequence[i].volume * (midiData[i].muted ? 0.75 : 1)

    // If there's no note to play, add the duration onto the next notes wait time
    if (volume === 0) {
      currentWaitTime += duration
      return newArr
    }

    const result = {
      pitch: midiData[i].pitch,
      velocity: volume * 100,
      channel,
      duration,
    }

    if (currentWaitTime !== 0) {
      result.wait = currentWaitTime
      currentWaitTime = 0
    }

    // take account of samples which are sharp in duration
    if (midiData[i].duration && midiData[i].duration < result.duration) {
      currentWaitTime = result.duration - midiData[i].duration
      result.duration = midiData[i].duration
    }

    return [...newArr, result]
  }, [])
}

const getTimemapFromTrack = track => {
  let accumulatedTime = 0
  return track.reduce((newArr, note, i, notes) => {
    const previousNote = notes[i - 1]
    accumulatedTime = accumulatedTime + (note.wait || 0) + (previousNote ? previousNote.duration : 0)
    return [...newArr, { ...note, timestamp: accumulatedTime }]
  }, [])
}

const combineMultipleTracks = (...tracks) => {
  const newTracks = tracks.map(getTimemapFromTrack)

  return newTracks
    .reduce((newArr, track) => [...newArr, ...track], [])
    .sort((a, b) => a.timestamp - b.timestamp)
    .reduce((newArr, note, i, notes) => {
      const previousNote = notes[i - 1]
      const nextNote = notes[i + 1]
      const wait = i === 0 && note.wait ? note.wait : 0

      if (previousNote && note.timestamp === previousNote.timestamp) {
        const prevNote = newArr[newArr.length - 1]
        return [
          ...newArr.slice(0, -1),
          {
            ...prevNote,
            duration: nextNote ? nextNote.timestamp - note.timestamp : note.duration,
            pitch: [...prevNote.pitch, ...note.pitch].sort(),
          },
        ]
      }

      return [
        ...newArr,
        {
          ...note,
          duration: nextNote ? nextNote.timestamp - note.timestamp : note.duration,
          pitch: note.pitch,
          wait,
        },
      ]
    }, [])
}

const getMidiTrack = (name, bpm, track, instrumentNumber) => {
  return new Track()
    .setTempo(bpm)
    .addInstrumentName(name)
    .addEvent([
      new ProgramChangeEvent({ instrument: instrumentNumber }),
      ...track.map(note => new NoteEvent(note)),
    ])
}

const getMidiDataURIFromInstruments = tracks => {
  return new Writer(tracks).dataUri()
}

const getInstrumentTrack = (instruments, instrumentID, channel) => {
  const instrument = instruments.find(i => i.id === instrumentID)
  const midiData = getMidiDataFromHitTypes(instrument.sounds, instrument.hitTypes)
  const track = getTrackFromInstrument(midiData, instrument.sequence, channel)

  return track
}

const buildMidiDataURIFromInstruments = (instruments, bpm) => {
  const kickTrack = getInstrumentTrack(instruments, 'k', 10)
  const snareTrack = getInstrumentTrack(instruments, 's', 10)
  const hihatTrack = getInstrumentTrack(instruments, 'h', 10)
  const cymbalTrack = getInstrumentTrack(instruments, 'c', 10)
  const guitarTrack = getInstrumentTrack(instruments, 'g', 0)

  const drumsTrack = combineMultipleTracks(snareTrack, hihatTrack, kickTrack, cymbalTrack)
  const drumsMidiTrack = getMidiTrack('Drums', bpm, drumsTrack)
  const guitarMidiTrack = getMidiTrack('Guitar', bpm, guitarTrack, 30)

  const base64 = getMidiDataURIFromInstruments([drumsMidiTrack, guitarMidiTrack])
  return base64
}

export {
  buildMidiDataURIFromInstruments,
  combineMultipleTracks,
  convertBeatLengthToMidiDuration,
  convertBPMtoMidi,
  getMidiDataURIFromInstruments,
  getMidiTrack,
  getMidiDataFromHitTypes,
  getTimemapFromTrack,
  getTrackFromInstrument,
}
