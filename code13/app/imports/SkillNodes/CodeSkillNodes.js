import C from './Common.js'

export default {
  $meta: {
    name: 'Coding',
    description: 'Represents coding skills',
  },
  js: {
    $meta: {
      name: 'Javascript',
      description: 'Javascript expertise',
    },
    basics: {
      statements: {
        const: C.E,
        let: C.meta({requires: ".const"}, C.E),
        var: C.D
      },
      math: {
        $meta: {
          requires: '.statements',
        },
        operators: {
          '+': C.E,
          '-': C.meta({requires: ".+"}, C.E),
          '*': C.meta({requires: ".-"}, C.E),
          '/': C.meta({requires: ".*"}, C.E),
        },
        constants: {
          PI: C.E
        },
        functions: {
          abs: C.meta({unlocks: ".round"}, C.E),
          round: C.E,
          max: C.E,
          min: C.E,
          random: C.meta({requires: ".min,.max"}, C.E),
          sqrt: C.meta({requires: ".min,.max", requireOneOf: 1}, C.E),
        }
      }
    },
    advanced: {
      math: {
        $meta: {
          requires: '..basics.math',
        },
        E: C.E,
        LN2: C.E,
        LN10: C.E,
        LOG2E: C.E,
        LOG10E: C.E,
        SQRT2: C.E,
        SQRT1_2: C.E
      }
    },
    fw: {
      $meta: {
        requires: '.basics',
      },
      phaser: {
        Game: C.E,
        Loader: C.E
      },
      jquery: {
        selectors: C.E,
        animations: C.E,
        plugins: C.D
      }
    }
  },
  c: {
    $meta: {
      name: 'C'
    },
    basics: {
      statements: C.E
    }
  }
}
