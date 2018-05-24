import _ from 'lodash'

// This is a simple Music Manager for Mage (actorMap) games

const _musicUrlPrefix = 'http://s3.amazonaws.com/apphost/game_music/'

// We only let one music track play at a time.. this_currentlyPlaying is the one..
// So that's why this thing is a global/singleton object instead of a class
let _currentlyPlaying = null // null, or the string which was the param to playMusic() which identifies the music

// See MgbMusic.musicList[] for the special list of built-in tracks.
// These are referenced as `[builtin]:${name}` and musicUrlFromMusicFileName() knows
// how to get from the full name (with the [builtin] prefix) to the URL (stored on S3 for now)

const MgbMusic = {
  musicUrlFromMusicFileName(name, oName) {
    if (!name || name === '') {
      console.error('Empty/invalid music filename provided to musicUrlFromMusicFileName')
      return ''
    }

    if (name.startsWith('[builtin]:')) {
      const safeName = name.replace(/^\[builtin\]:/, '')
      return _musicUrlPrefix + safeName
    } else {
      name = _.includes(name, ':') ? name : oName + ':' + name
      return '/api/asset/music/' + name.split(':')[0] + '/' + name.split(':')[1] + '/music.mp3'
    }
  },

  _loadedMusic: {}, // This is a place we store/cache loaded music. // TODO: Consider memory implications - Consider just keeping N entries

  // TODO: A preloader method..which is why there is a loadedMusic structure here for future use.
  loadMusic(musicSource, oName) {
    if (!musicSource || musicSource === '' || musicSource === 'none') return

    const canplay = function(e) {
      if (!e || !e.target) return
      const music = e.target

      try {
        // Only try to play it if it hasn't since been cancelled or superceded. Think async!
        if (_currentlyPlaying && music === MgbMusic._loadedMusic[_currentlyPlaying]) {
          console.log(
            `playMusic():canplay() Matched music as ${_currentlyPlaying} and is attempting to start it`,
          )
          e.target.play()
        }
      } catch (err) {
        console.error(`playMusic():canplay() Failed to play post-loaded music '${_currentlyPlaying}': `, err)
      }
      // now remove the handler, otherwise it will restart when it stops
      e.target.removeEventListener('canplaythrough', canplay, false)
    }

    const newMusic = document.createElement('audio')
    MgbMusic._loadedMusic[musicSource] = newMusic
    _currentlyPlaying = musicSource
    newMusic.addEventListener('canplaythrough', canplay, false)
    newMusic.src = MgbMusic.musicUrlFromMusicFileName(musicSource, oName)
    newMusic.volume = 0.4
  },
  playMusic(musicSource, oName) {
    if (musicSource && musicSource === _currentlyPlaying) {
      // Too noisy...  console.log(`playMusic determined that '${musicSource}' is already playing, so no action required`)
      return
    }

    console.log(`playMusic requested: ${musicSource}`)

    MgbMusic.stopMusic() // First stop anything playing

    if (!musicSource || musicSource === '' || musicSource === 'none') return // Our job is done :)

    const music = MgbMusic._loadedMusic[musicSource]
    if (music) {
      _currentlyPlaying = musicSource
      music.play().catch(err => {
        // cannnot load music, or cannot handle this music encoding... let devs know about it, but don't break functionality
        console.error('playMusic() Unable to play pre-loaded music: ', err)
      })
    } else {
      MgbMusic.loadMusic(musicSource, oName)
    }
  },

  stopMusic() {
    if (!_currentlyPlaying) {
      console.log(`StopMusic requested - but there's nothing playing to stop`)
      return
    }

    const music = MgbMusic._loadedMusic[_currentlyPlaying]
    if (!music) {
      console.log(
        `StopMusic requested: _currentlyPlaying was ${_currentlyPlaying}, but for some reason it doesn't exist, so no media to stop`,
      )
      _currentlyPlaying = null
      return
    }

    console.log(
      `StopMusic being enacted: _currentlyPlaying was ${_currentlyPlaying} and the media was at ${music.currentTime} when music.pause() is invoked`,
    )
    _currentlyPlaying = null
    music.currentTime = 0
    music.pause()
  },

  _soundSourceAttributionMessage:
    'Sound sources used here with permission:\n' +
    '  JoCo files: publicly-licensed (JonathanCoulton.com)\n' +
    '  McLeod9 files: usage permission granted by Greg McLeod (McLeodGaming.com)\n' +
    '  Shudder files: usage permission granted by DrBlakeman (ShudderMusic.com)\n' +
    '  Soundsnap files: publicly-licensed files (SoundSnap.com)',

  musicList: [
    'none',
    'joco/Skullcrusher%20Mountain.mp3',
    'joco/MrFancyPants.mp3',
    'joco/WhenYouGo.mp3',
    'joco/SkyMall.mp3',
    'joco/ImYourMoon.mp3',
    'joco/IFeelFantastic.mp3',
    'joco/CreepyDoll.mp3',
    'joco/ChironBetaPrime.mp3',
    'joco/BigBadWorldOne.mp3',

    'soundsnap/multibeat2.mp3',
    'soundsnap/Grubberoid.mp3',
    'soundsnap/90 BPM BIG.mp3',
    'soundsnap/90 BPM BIG 02.mp3',
    'soundsnap/80_0_4_C_dstringplukz_mo.mp3',
    'soundsnap/ab.mp3',
    'soundsnap/bass chord.mp3',
    'soundsnap/bass-and-metallic-scrapes.mp3',
    'soundsnap/bassline - 02.mp3',
    'soundsnap/bawa sushil.mp3',
    'soundsnap/BigMovieScore-104.mp3',
    'soundsnap/Crackle 105BPM.mp3',
    'soundsnap/deepest-dank-jungle-130.mp3',
    'soundsnap/E_Melody1_Cm_120.mp3',
    'soundsnap/EarCatcher.mp3',
    'soundsnap/Fascinate.mp3',
    'soundsnap/feel-the-static-synth-C-138.mp3',
    'soundsnap/funkyhollywood.mp3',
    'soundsnap/happy-woodwind-loop-100.mp3',
    'soundsnap/Heart Drum 130 BPM.mp3',
    'soundsnap/Heart Drum 90 BPM.mp3',
    'soundsnap/Horror Harp.mp3',
    'soundsnap/Horror Strings 3.mp3',
    'soundsnap/Horror Strings.mp3',
    'soundsnap/Horror Violins 3.mp3',
    'soundsnap/mash-together-bass.mp3',
    'soundsnap/Meditation 70BPM.mp3',
    'soundsnap/MelodicMinorlogic-bass-128.mp3',
    'soundsnap/NoWayOut.mp3',
    'soundsnap/pagoda-synth-130.mp3',
    'soundsnap/pipe_organ4.mp3',
    'soundsnap/polka.mp3',
    'soundsnap/Psycho.mp3',
    'soundsnap/Rarirara 120BPM.mp3',
    'soundsnap/Rhodes BPM 86_18 C.mp3',
    'soundsnap/Robodrone-synth-D-128.mp3',
    'soundsnap/sinister-pad-G_-138.mp3',
    'soundsnap/spookyorgan.mp3',
    'soundsnap/Strange Alarm 130BPM.mp3',
    'soundsnap/sub-dubble-bass.mp3',
    'soundsnap/trippin-beat-got-air-130.mp3',
    'soundsnap/Vintage Loop 120BPM.mp3',

    'shudder/Anchors.mp3',
    'shudder/Another Buena Vista Sunset.mp3',
    'shudder/Beam of Light.mp3',
    'shudder/gnight.mp3',
    'shudder/Horses in the Dark.mp3',
    'shudder/In Case of Fire.mp3',
    'shudder/Ma Blues.mp3',
    'shudder/MIGRAINE.mp3',
    'shudder/Nothing Like the Summer.mp3',
    'shudder/Now What ~or~ The Last Laugh.mp3',
    'shudder/Penguin.mp3',
    'shudder/Regarding the Phosphenes.mp3',
    'shudder/Sandalwood and Leather.mp3',
    'shudder/Something (April Breeze).mp3',
    'shudder/Something (Else).mp3',
    'shudder/Song of the Unemployed.mp3',
    'shudder/The Most Incredible Thing I Heard Last Year.mp3',
    'shudder/The Scramble.mp3',
    'shudder/Therapy, Etc.mp3',
    'shudder/Thoughts on the Nature of Existence.mp3',

    'McLeod9/AnimusTheme (Extended).mp3',
    'McLeod9/AnimusTheme.mp3',
    'McLeod9/AnimusThemeRevisited.mp3',
    'McLeod9/Aura.mp3',
    'McLeod9/BeginningAnew.mp3',
    'McLeod9/BeneathTheLab.mp3',
    'McLeod9/BitsForDinner.mp3',
    'McLeod9/CleodGroove.mp3',
    'McLeod9/CleodStorm.mp3',
    'McLeod9/CrystalCaverns.mp3',
    'McLeod9/Cyber Track Act 1 Cleod 9 Remix.mp3',
    'McLeod9/DandyAndSwell.mp3',
    'McLeod9/Depredation.mp3',
    'McLeod9/Depredation_v2.mp3',
    'McLeod9/DistantAmbiance.mp3',
    'McLeod9/DuskInterlude.mp3',
    'McLeod9/EndofAllThis.mp3',
    'McLeod9/Fear Ave.mp3',
    'McLeod9/FightingOfTheSpiritRemix.mp3',
    'McLeod9/FinalHope.mp3',
    'McLeod9/MindGear.mp3',
    'McLeod9/PokemonBattleRemix.mp3',
    'McLeod9/PureEternity.mp3',
    'McLeod9/TheFirstMovement.mp3',
    'McLeod9/TheLastBloodshed.mp3',
    'McLeod9/TheOriginalBlade.mp3',
    'McLeod9/ThePerfectBattle.mp3',
    'McLeod9/Wrecked.mp3',
  ],
}

export default MgbMusic
