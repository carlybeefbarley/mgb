// Import CodeMirror and its various dependencies.
//   This is not as simple as it might sound...

// 1) Due to Meteor 1.3 import limitations, there are also symlinks in the
//    /package-assets-symlink-hack/ directory for the CSS etc files that
//    CodeMirror needs.
// 2) We load JSHINT from /app.htm in browser because JSHINT redefines some fundamental
//    globals like 'utils' and 'event', and that confuses node/meteor greatly.
//
// Things get even more complicated once TERN (the code analysis system use for autocomplete smarts)
import CodeMirror from 'codemirror'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/mode/css/css'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/edit/matchbrackets'

import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/addon/fold/xml-fold'
import 'codemirror/addon/lint/lint'
// import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/scroll/annotatescrollbar'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'

// Not used yet
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/fold/xml-fold';
// import 'codemirror/addon/fold/markdown-fold';

export default CodeMirror
