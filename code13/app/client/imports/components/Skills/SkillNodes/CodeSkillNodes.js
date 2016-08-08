import { E, D } from './Common.js'

export default {
  $name: 'Coding',
  $description: 'Represents coding skills',
  js: {
    $name: 'Javascript',
    $description: 'Javascript expertise',
    basics: {
      statements: {
        const: E,
        let: E,
        var: D
      },
      math: {
        $requires: '.statements',
        operators: {
          '+': E,
          '-': E,
          '/': E,
          '*': E
        },
        constants: {
          PI: E
        },
        functions: {
          abs: E,
          round: E,
          max: E,
          min: E,
          random: E,
          sqrt: E
        }
      }
    },
    advanced: {
      math: {
        $requires: '..basics.math',
        E: E,
        LN2: E,
        LN10: E,
        LOG2E: E,
        LOG10E: E,
        SQRT2: E,
        SQRT1_2: E
      }
    },
    fw: {
      $requires: '.basics',
      phaser: {
        Game: E,
        Loader: E
      },
      jquery: {
        selectors: E,
        animations: E,
        plugins: D
      }
    }
  },
  c: {
    $name: 'C',
    basics: {
      statements: E
    }
  }
}
