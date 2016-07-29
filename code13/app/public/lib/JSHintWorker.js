importScripts("/lib/jshint.min.js");
//importScripts("https://cdnjs.cloudflare.com/ajax/libs/jshint/2.9.1/jshint.min.js");

onmessage = function(e) {
  var str = e.data[0];
  var conf = e.data[1];
  JSHINT(str, conf);

  postMessage([JSHINT.errors]);
};
