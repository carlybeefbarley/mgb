/*
here are defined some known libs - so we can be sure that we are resolving import X from 'lib' correctly
structure:
defs: if there are defs - we will load defs in the code editor otherwise we will look for src
src: this is loaded in the code editor if there is no defs - to show better hints
min: this is loaded in the bundled version of the game
useGlobal: this is special flag for libs which doesn't use modules to load itself, but instead adds variable to global scope - e.g. Phaser

** src is not used at all if defs and min are present
 */
const knownLibs = {
  common: {
    // these will be loaded automatically in every editCode instance
    defs: () => ['/lib/tern/defs/browser.json', '/lib/tern/defs/ecmascript.json'],
  },
  phaser: {
    useGlobal: true,
    src(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/phaser/' + version + '/phaser.js'
    },
    min(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/phaser/' + version + '/phaser.min.js'
    },
    defs: () => ['/lib/tern/defs/phaser.old.json'],
  },
  phaser3: {
    useGlobal: true,
    src(version) {
      version = '3.6.0'
      return 'https://cdn.jsdelivr.net/gh/photonstorm/phaser@' + version + '/dist/phaser.js'
    },
    min(version) {
      version = '3.6.0'
      return 'https://cdn.jsdelivr.net/gh/photonstorm/phaser@' + version + '/dist/phaser.min.js'
    },
    defs: () => [],
  },
  react: {
    src(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/react/' + version + '/react.js'
    },
    min(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/react/' + version + '/react.min.js'
    },
    defs: () => ['/lib/tern/defs/react.json'],
  },
  'react-dom': {
    src(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/react/' + version + '/react-dom.js'
    },
    min(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/react/' + version + '/react-dom.min.js'
    },
    // react defs contain also ReactDOM
    defs: () => ['/lib/tern/defs/react.json'],
  },
  lodash: {
    src(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/lodash/' + version + '/lodash.js'
    },
    min(version) {
      version = version || 'latest'
      return 'https://cdn.jsdelivr.net/lodash/' + version + '/lodash.min.js'
    },
    defs: () => ['/lib/tern/defs/lodash.json'],
  },
}

export default knownLibs
