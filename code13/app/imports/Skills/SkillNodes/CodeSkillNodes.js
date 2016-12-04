import C from './CommonSkillNodes.js'


// These will be inserted into {code: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

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
        description:'The JavaScript programming language'
      },
      basics: {
        comments:     C.E,
        statements: {
          let:        C.E,
          const:      C.meta( {requires: ".let" }, C.E),
          var:        C.E,
          'undefined':C.E,
          'null':     C.E
        },
        functions: {
          definition:  C.E,
          return:      C.E
          // For advanced... arguments, bin, apply, call, classes etc
        },
        types: {
          'number':   C.E,
          'string':   C.E,
          'array':    C.E,
          'object':   C.E,
          'boolean':  C.E
        },
        booleans: {
          'true':     C.E,
          'false':    C.E
        },
        math: {
          $meta: {
            requires: '.statements',
          },
          operators: {
            '+':      C.E,
            '-':      C.E,
            '*':      C.E,
            '/':      C.E
          },
          constants: {
            PI:         C.E,
            'NaN':      C.E,
            'Infinity': C.E
          },
          functions: {
            abs:      C.meta( {unlocks: ".round" }, C.E),
            round:    C.E,
            max:      C.E,
            min:      C.E,
            random:   C.meta( {requires: ".min,.max" }, C.E),
            sqrt:     C.meta( {requires: ".min,.max", requireOneOf: 1 }, C.E),
          }
        }
      },
      advanced: {
        types: {
          'regex':   C.E,
        },        
        math: {
          $meta: {
            requires: '..basics.math',
          },
          E:          C.E,
          LN2:        C.E,
          LN10:       C.E,
          LOG2E:      C.E,
          LOG10E:     C.E,
          SQRT2:      C.E,
          SQRT1_2:    C.E
        },
        this: {
          $meta: {
            requires: '..basics',
          },
          'closures':     C.E,
          'methods':      C.E,
          'binding':      C.E        
        }
      },
    },

    clientfw: {
      $meta: {
        requires:   '.lang.basics',
        name:       'Javascript Client Frameworks',
        description:'Represents coding skills'
      },
      phaser: {
        $meta: {
          name:       'PhaserJS',
          description:'PhaserJS Game Development Framework'
        },
        Game:       C.E,
        Loader:     C.E
      },
      react: {
        $meta: {
          name:       'ReactJS',
          description:'reactJS App Development Framework'
        },
        jsx:        C.E,
        stateless:  C.E,    // TODO: Requires fatArrow
        components: C.E,
        props:      C.E,
        state:      C.E        
      },
      jquery: {
        $meta: {
          //requires: 'DOM',
          name:       'jQuery',
          description:'jQuery DOM manipulation framework'
        },
        selectors:  C.E,
        animations: C.E,
        plugins:    C.E
      }
    }
  },

  elm: {
    $meta: {
      name: 'Elm'
    },
    basics: {
      statements: C.E
    }
  }
}
