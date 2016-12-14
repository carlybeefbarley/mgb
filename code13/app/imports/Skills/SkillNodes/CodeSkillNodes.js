import C from './CommonSkillNodes'

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
      'comments':     C.En(0),

      'statements': {
        'var':        C.En(0),
        'let':        C.En(1),
        'const':      C.meta( {requires: ".let" }, C.En(1)),
        'undefined':  C.En(0),
        'null':       C.En(0)
      },

      "functions": {
        "function":          C.En(0),
        "return":            C.En(0),
        "arrow-functions":   C.En(1),
        "arguments-object":  C.En(1),     // i.e. the array-like object... https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/arguments
      },

      types: {
        'number':   C.En(0),
        'boolean':  C.En(0),
        'string':   C.En(0),
        'array':    C.En(0),
        'object':   C.En(0),
        'regex':    C.En(1)
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

        'plus':                    C.En(0),      //  +
        'minus':                   C.En(0),      //  -   Note that there is a-b and the unary -x
        'asterisk':                C.En(0),      //  *
        'slash':                   C.En(0),      //  /
        'percent':                 C.En(1),      //  %   (remainder)

        'plusplus':                C.En(0),      //  ++  Note that there are both pre- and post- versions
        'minusminus':              C.En(0),      //  --  Note that there are both pre- and post- versions
        
        'delete':                  C.En(2),      //  delete       https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/delete
        'typeof':                  C.En(2),      //  typeof
        'instanceof':              C.En(2),      //  instanceof
        'void':                    C.En(3),      //  void         https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/void

        'in':                      C.En(2),      //  in           TODO - handle the variants.. for..in     and     x in y    see..  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/in, https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty , url3: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for...in
        "spread":                  C.En(2),      //  ...          ES6  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Spread_operator

        'questionmark':            C.En(1),      //  ?            Ternary ? operator
        'colon':                   C.En(1),      //  :            Ternary : operand separator
        
        'comma':                   C.En(1),      //  ,            Various uses - array/object separator, expression sequence, declaration sequence etc
        
        'tilde-bitwise-not':       C.En(3),      //  ~
        'ampersand-bitwise-and':   C.En(3),      //  &
        'pipe-bitwise-or':         C.En(3),      //  |
        'caret-bitwise-xor':       C.En(3),      //  ^
        'lessless-bitwise-shift-left':        C.En(4),    //  <<
        'greatergreater-bitwise-shift-right': C.En(4),    //  >>
        'greatergreatergreater-bitwise-zero-fill-shift-right': C.En(4),  // >>>
        
        'bang-logical-not':        C.En(1),      //  !
        'ampersandampersand-logical-and': C.En(1),// &&
        'pipepipe-logical-or':     C.En(1),      //  ||

        'equality':                C.En(0),      //  ==
        'inequality':              C.En(0),      //  !=
        'identity-equality':       C.En(0),      //  ===
        'identity-inequality':     C.En(0),      //  !==
        
        'less-than':               C.En(0),      //  <
        'less-than-or-equal':      C.En(0),      //  <=
        'greater-than':            C.En(0),      //  >
        'greater-than-or-equal':   C.En(0)       //  >=
      },

      math: {
        $meta: {
          requires: '.statements',
        },
        constants: {
          'PI':         C.En(1),
          'NaN':        C.En(1),
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
        "new":         C.En(1),     // ES5 and ES6
        "class":       C.En(1),
        "constructor": C.En(1),     // ES5 and ES6
        "extends":     C.En(2),
        "super":       C.En(2)
      },

      modules: { 
        'import':      C.En(1),
        'from':        C.En(1),     // note it can be used in import and export
        'as':          C.En(1),
        'asterisk':    C.En(1),     // e.g import defaultMember, * as name from "module-name";
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

    clientfw: {
      $meta: {
        requires:   '.lang.basics',
        name:       'Javascript Client Frameworks',
        description:'Client frameworks are libararies of functions that help with writing code that will run in a browser. They include game libraries'
      },
      phaser: {
        $meta: {
          name:       'PhaserJS',
          description:'PhaserJS Game Development Framework'
        },
        Game:       C.En(1),
        Loader:     C.En(1)
      },
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
