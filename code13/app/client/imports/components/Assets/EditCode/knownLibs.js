// TODO: add predefined defs files
// TODO: load these defs dynamically
// import Defs_phaser from "./tern/Defs/DefsPhaser";
// import DefsLodash from "./tern/Defs/DefsLodash";

export default {
  common: {
    defs: () => [
      '/lib/tern/defs/browser.json',
      '/lib/tern/defs/ecmascript.json',
      // '/lib/tern/defs/test.json' // for testing purposes only :)
      //,'/lib/tern/defs/phaser.new.json'
    ]
  },
  phaser: {
    useGlobal: true,
    src: function (version) {
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/phaser/' + version + '/phaser.js';
    },
    defs: () => ['/lib/tern/defs/phaser.old.json']
  },
  react: {
    src: function (version) {
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/react/' + version + '/react.js';
    },
    // prevent React from loading huge source file
    // TODO: generate defs
    //defs: {}
  },
  "react-dom": {
    src: function (version) {
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/react/' + version + '/react-dom.min.js';
    }
  },
  lodash: {
    //return 'https://cdn.jsdelivr.net/' + lib + '/latest/' + lib + ".js"
    src: function (version) {
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/lodash/' + version + '/lodash.js';
    },
    defs: () => ['/lib/tern/defs/lodash.json']
  }
}
