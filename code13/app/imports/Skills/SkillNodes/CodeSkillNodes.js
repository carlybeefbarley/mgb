import C from './CommonSkillNodes'

import CodePhaserSkillNodes from './CodePhaserSkillNodes'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { code: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js


// Some shorthands to save space and time for common nodes
// Enabled Leaf Node, Learning Level = 0..4 (0 = beginner). See CommonSkillNodes.js for info

export default {
  $meta: {
    name:           'Coding',
    description:    'Represents coding skills',
  },
  js: {
    $meta: {
      name:         'Javascript',
      description:  'JavaScript Programming',
    },
    lang: {
      $meta: {
        name:       'JavaScript Language',
        description:'The JavaScript programming language',
        sequence:   'comments,statements,functions,types,control-flow,booleans,operators,math,modules,classes,generators,exceptions,this'
      },


      'comments' : {
        $meta: {
          name: 'Comment your JavaScript Code',
          description: [
            "Comments are lines of code that JavaScript will intentionally ignore. Comments are a great way to leave notes to yourself and to other people who will later need to figure out what that code does.",
            "There are two ways to write comments in JavaScript:",
            "Using <code>//</code> will tell JavaScript to ignore the remainder of the text on the current line:",
            "<blockquote>// This is an in-line comment.</blockquote>",
            "You can make a multi-line comment beginning with <code>/*</code> and ending with <code>*/</code>:",
            "<blockquote>/* This is a <br>   multi-line comment */</blockquote>",
            "<strong>Best Practice</strong><br>As you write code, you should regularly add comments to clarify the function of parts of your code. Good commenting can help communicate the intent of your code&mdash;both for others <em>and</em> for your future self.",
            "<hr>",
            "Try creating one of each type of comment."
          ],
          "code": [
            " // comments code "
          ],
          "solutions": [
            "// Fake Comment\n/* Another Comment */"
          ],
          "tests": [
            "assert(code.match(/(\\/\\/)...../g), 'message: Create a <code>//</code> style comment that contains at least five letters.');",
            "assert(code.match(/(\\/\\*)([^\\*\\/]{5,})(?=\\*\\/)/gm), 'message: Create a <code>/* */</code> style comment that contains at least five letters.');"
          ]
        },
        skill: C.En(0)
        
      },



      // 'comments':     C.En(0),

      'statements': {
        'var':        C.En(0),
        'let':        C.En(2),
        'const':      C.meta( {requires: ".let" }, C.En(2)),
        'undefined':  C.En(0),
        'null':       C.En(0)
      },

      'scope': {
        'global':          C.En(0),    // acorn/tern have TokenType='variable'
        'local':           C.En(0),    // acorn/tern have TokenType='variable-2' but it doesn't seem to distinguish block scope from execution scope
          // Per MDN..https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var
          // for  var   " The scope of a variable declared with var is its current execution context, which is either the enclosing function or, for variables declared outside any function, global."
          // for  whereas const or let have block scope
        'local-execution': C.En(2),      // for  var   " The scope of a variable declared with var is its current execution context, which is either the enclosing function or, for variables declared outside any function, global."
        'local-block':     C.En(2),      // for  const/let        
      },

      "functions": {
        "function":          C.En(0),
        "return":            C.En(0),
        "arrow-functions":   C.En(2),
        "arguments-object":  C.En(2),     // i.e. the array-like object... https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/arguments
      },

      types: {
        'number':   C.En(0),
        'boolean':  C.En(0),
        'string':   C.En(0),
        'array':    C.En(0),
        'object':   C.En(0),
        'regex':    C.En(2)
      },

      "control-flow": {  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
        'if':       C.En(0),
        "else":     C.En(0),
        "switch":   C.En(0),
        "case":     C.En(0),
        "case-default:": C.En(0),
        "label":    C.En(0),  // the weird thing where you can break <label> or continue <label>  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/label
        "break":    C.En(0),
        "continue": C.En(0),
        "for":      C.En(0),
        "of":       C.En(0),    // in the context of  'for': https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for...of
        "while":    C.En(0),
        "do":       C.En(0),
        "do-while": C.En(0)
      },

      booleans: {
        'true':     C.En(0),
        'false':    C.En(0)
      },

      operators: {    // These can have weird contexts sometimes (heavy symbol overuse in js) so I decifed to just word-the-symbols for keys. Note that - is a separator maybe, so watch out for that (test any cases with - in keys). Doubl-ewatch-out for . and ,
        'equals-assignment':                        C.En(0),  //  =
        'plusequals-addition-assignment':           C.En(1),  //  +=
        'minusequals-subtraction-assignment':       C.En(1),  //  -=
        'asteriskequals-multiplication-assignment': C.En(2),  //  *=
        'slashequals-division-assignment':          C.En(2),  //  /=
        'percentequals-remainder-assignment':       C.En(3),  //  %=

        'plus':                    C.En(1),      //  +
        'minus':                   C.En(1),      //  -   Note that there is a-b and the unary -x
        'asterisk':                C.En(1),      //  *
        'slash':                   C.En(1),      //  /
        'percent':                 C.En(2),      //  %   (remainder)

        'plusplus':                C.En(2),      //  ++  Note that there are both pre- and post- versions
        'minusminus':              C.En(2),      //  --  Note that there are both pre- and post- versions
        
        'delete':                  C.En(2),      //  delete       https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/delete
        'typeof':                  C.En(2),      //  typeof
        'instanceof':              C.En(2),      //  instanceof
        'void':                    C.En(3),      //  void         https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/void

        'in':                      C.En(3),      //  in           TODO - handle the variants.. for..in     and     x in y    see..  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/in, https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty , url3: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for...in
        "spread":                  C.En(3),      //  ...          ES6  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Spread_operator

        'questionmark':            C.En(2),      //  ?            Ternary ? operator
        'colon':                   C.En(2),      //  :            Ternary : operand separator
        
        'comma':                   C.En(1),      //  ,            Various uses - array/object separator, expression sequence, declaration sequence etc
        
        'tilde-bitwise-not':       C.En(3),      //  ~
        'ampersand-bitwise-and':   C.En(3),      //  &
        'pipe-bitwise-or':         C.En(3),      //  |
        'caret-bitwise-xor':       C.En(3),      //  ^
        'lessless-bitwise-shift-left':        C.En(4),    //  <<
        'greatergreater-bitwise-shift-right': C.En(4),    //  >>
        'greatergreatergreater-bitwise-zero-fill-shift-right': C.En(4),  // >>>
        
        'bang-logical-not':        C.En(2),      //  !
        'ampersandampersand-logical-and': C.En(2),// &&
        'pipepipe-logical-or':     C.En(2),      //  ||

        'equality':                C.En(1),      //  ==
        'inequality':              C.En(1),      //  !=
        'identity-equality':       C.En(1),      //  ===
        'identity-inequality':     C.En(1),      //  !==
        
        'less-than':               C.En(1),      //  <
        'less-than-or-equal':      C.En(1),      //  <=
        'greater-than':            C.En(1),      //  >
        'greater-than-or-equal':   C.En(1)       //  >=
      },

      math: {
        $meta: {
          requires: '.statements',
        },
        constants: {
          'PI':         C.En(1),
          'NaN':        C.En(2),
          'Infinity':   C.En(2),
          'E':          C.En(3),
          'LN2':        C.En(3),
          'LN10':       C.En(3),
          'LOG2E':      C.En(3),
          'LOG10E':     C.En(3),
          'SQRT2':      C.En(3),
          'SQRT1_2':    C.En(3)
        },
        functions: {
          pow:          C.En(1),
          abs:          C.meta( {unlocks: ".round" }, C.En(1)),
          round:        C.En(1),
          max:          C.En(1),
          min:          C.En(1),
          random:       C.meta( C.En(1) ),
          sqrt:         C.En(1), // test case was C.meta( {requires: ".min,.max", requireOneOf: 1 }, C.En(0)),
        },
      },
      
      "classes": {  // ES6
        "new":         C.En(2),     // ES5 and ES6
        "class":       C.En(2),
        "constructor": C.En(2),     // ES5 and ES6
        "extends":     C.En(3),
        "super":       C.En(2)
      },

      modules: { 
        'import':      C.En(1),
        'from':        C.En(1),     // note it can be used in import and export
        'as':          C.En(1),
        'asterisk':    C.En(2),     // e.g import defaultMember, * as name from "module-name";
        "export":      C.En(1),
        "default":     C.En(1)      // TODO: export default.. test disambigaution with case
      },

      "generators": {
        "yield":       C.En(4),
        "function*":   C.En(4),
      },

      exceptions: {
        "debugger":    C.En(1),
        "throw":       C.En(2),
        "Error":       C.En(2),
        "try":         C.En(2),
        "catch":       C.En(2),
        "finally":     C.En(2)
      },

      this: {
        'closures':       C.En(2),
        'methods':        C.En(2),
        'binding':        C.En(2),
        'call-function':  C.En(2),
        'apply-function': C.En(2)
      }
    },

    'lodash': {
      $meta: {
//        requires:   '..js.IDKWHAT',
        name:       'Lodash library',
        description:'Lodash is a library of powerful javascript functions to help with comparisons and transformations of data. Learning it will help you write reliable code more quickly. It is useful for client code or for server code'
      },      
    },

    phaser: CodePhaserSkillNodes,
    
    react: {
      $meta: {
        name:       'ReactJS',
        description:'reactJS App Development Framework'
      },
      jsx:        C.En(1),
      stateless:  C.En(1),    // TODO: Requires fatArrow
      components: C.En(1),
      props:      C.En(1),
      state:      C.En(1)
    },
    jquery: {
      $meta: {
        //requires: 'DOM',
        name:       'jQuery',
        description:'jQuery DOM manipulation framework'
      },
      selectors:  C.En(1),
      animations: C.En(1),
      plugins:    C.En(1)
    }
  },

  regex: {
    $meta: {
      name: 'Regular expressions',
      description: `Javascript (and most programming languages) use 'regular expressions' to search for patterns within text strings.  A (slightly scary) example is ^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$ which tests if a string appears to be a valid email address.`
    },
    basics: {
      literals:           C.En(1),       // letters, numbers some symbols like @
      'start-of-line':    C.En(1),       //  ^ outside of [  ]
      'end-of-line':      C.En(1),       //  $
      'one-or-more':      C.En(1),       //  +
      'zero-or-more':     C.En(1),       //  *
      'match-any-char':   C.En(1),       //  .
      'escape-character': C.En(1),       //  \
      'not-one-of':       C.En(2),       //  ^ within [  ]
      'range':            C.En(2),       //  - within [  ]   
      'n-of':             C.En(3),       //  { , } after another pattern
    }
  },

  "cloud-services": {
    $meta: {
      name: 'Cloud Services',
      description: `Cloud Services are provided by internet-based servers to fulfill certain tasks, usually as some kind of Appplication Programming Interface (API). For example, Google provides Cloud Service APIs to enable your programs to search the internet for information`
    },
    basics: {
      statements: C.En(1)
    }    
  }
}
