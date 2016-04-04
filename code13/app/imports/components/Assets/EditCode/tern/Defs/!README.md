TERN definitions for various libraries
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

These def files have been extracted from some other npm packages so that they can be more easily enhanced and edited for MGB. 
At some point we may contribute them back to the npm/tern community

I like the idea of making edit/enhancement of Def files a core part of the MGB system.. 


There is some tooling to autogenerate them. See http://stackoverflow.com/questions/18978778/ternjs-generate-json-type-definition-file 


Manually extracted from https://github.com/angelozerr/tern-phaser/blob/master/phaser.js
  phaser.json     

Straight copy from https://github.com/ternjs/tern/tree/master/defs (MIT LICENSE: https://github.com/ternjs/tern/blob/master/LICENSE)
  browser.json
  ecma5.json
  ...not included, but easy to incorporate if we want: 
    chai.json       - definitions for the http://chaijs.com/ testing library
    jquery.json     - definitions for the jQuery utility library 
    underscore.json - definitions for the underscore.js utility library
    ecma6.json      - definitions for ecma6
    
  