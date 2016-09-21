// TODO: add predefined defs files
// TODO: load these defs dynamically
import Defs_phaser from "./tern/Defs/DefsPhaser";
import DefsLodash from "./tern/Defs/DefsLodash";

export default {
  phaser: {
    useGlobal: true,
    src: function (version) {
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/phaser/' + version + '/phaser.min.js';
      //return 'http://localhost:3000/phaser/2.4.6/phaser.js'
      //return '/phaser/' + version + '/phaser.min.js'
    },
    defs: Defs_phaser
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
    defs: DefsLodash
  }
}

