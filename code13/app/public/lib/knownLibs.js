// CDNs should be safe as we are loading only text strings
window.module = window.module || {};
window.module.exports = {
  // wzrd serves bad version of phaser because it requires extra steps to build: https://www.npmjs.com/package/phaser#browserify--cjs
  phaser: {
    useGlobal: true,
    src: function(version){
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/phaser/'+version+'/phaser.min.js';
      //return 'http://localhost:3000/phaser/2.4.6/phaser.js'
      //return '/phaser/' + version + '/phaser.min.js'
    }
  },
  // react dom from wzrd uses separate react source
  "react-dom": {
    src: function(version) {
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/react/'+version+'/react-dom.js';
    }
  },
  // use react from same cdn as react-dom for better compatibility
  react: {
    src: function(version) {
      version = version || "latest";
      return 'https://cdn.jsdelivr.net/react/'+version+'/react.js';
    }
  },
  "test": {
    src: function () {
      return '/test.js'
    }
  }
}

