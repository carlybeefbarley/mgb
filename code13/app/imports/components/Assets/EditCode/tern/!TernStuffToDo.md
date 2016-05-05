So much goodness
- Here's the bar regarding Microsoft Visual Studio -
   https://blogs.msdn.microsoft.com/jasonz/2012/05/10/my-favorite-features-improved-tooling-in-visual-studio-11-for-javascript-developers/
- Here's a backgrounder on tern: http://marijnhaverbeke.nl/blog/tern.html
- Regarding codemirror - http://marijnhaverbeke.nl/blog/#cm-internals
- Example of a tern extension: https://github.com/angelozerr/tern-outline/blob/master/outline.js



HANDY WAY TO DO THIS...


import Inspector from 'react-inspector';

<Inspector name="TernStuff" expandLevel={3} data={INSPECTDATA} />


Some things to build on tern
============================

https://github.com/angelozerr/tern-comments-generator
 - Generate jsdocs from function header.. but this did a crappy job on the phaser.js defs

https://github.com/angelozerr/tern-guess-types
 - Guest parameters to suggest based on context and types

https://github.com/angelozerr/CodeMirror-Extension
 - completion with templates, completion context, hyperlink, hover
 * ****NOTE*** No AMD/CommonJS modules

https://github.com/angelozerr/CodeMirror-JavaScript
 - tern-extension.js mashes the global a bit brutally -  CodeMirror.tern, CodeMirror.ternHint() etc.. see (https://github.com/angelozerr/CodeMirror-JavaScript/blob/master/addon/hint/tern/tern-extension.js)
 - A bunch of javascript templates for use with CodeMirror-Extension (see https://raw.githubusercontent.com/angelozerr/CodeMirror-JavaScript/master/addon/hint/javascript/javascript-templates.js)
 - tern-hover.js seems kinda messed up - https://github.com/angelozerr/CodeMirror-JavaScript/blob/master/addon/hint/tern/tern-hover.js
  - tern-hyperlink.js also seems a bit thin - https://github.com/angelozerr/CodeMirror-JavaScript/blob/master/addon/hint/tern/tern-hyperlink.js
  
  
  
NOTE THAT THE http://demo-angelozerr.rhcloud.com/CodeMirror-Java/phaser.html demo has one neat trick.. it shows when functions have the wrong params..
    
    back = game.add.image(0, -400, 'lazur');
    back.scale.set(2);
    // The above has as lint error saying the param is the wrong type.
    HOW??  maybe just          editor.setOption("lint", {getAnnotations: CodeMirror.ternLint, async : true, server: CodeMirror.tern.getServer(editor)})



	<script src="codemirror/addon/lint/lint.js"></script>
    <link rel="stylesheet" href="codemirror/addon/lint/lint.css">
    <script src="ternjs/tern-lint/lint.js"></script>
    <script src="ternjs/tern-lint/codemirror/addon/lint/tern-lint.js"></script>
    
https://github.com/angelozerr/tern-outline/blob/master/outline.js
 - An outline of the Javascript file. seems nice. No dependencies despite package file?
  
https://github.com/katspaugh/tj-mode
 - Highlight JavaScript with Tern.



Not likely...
==============

https://github.com/angelozerr/tern-jshint/blob/master/jshint.js
 - JSHINT in the tern server. idk why
 
 
 
 