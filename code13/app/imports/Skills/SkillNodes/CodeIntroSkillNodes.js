import C from './CommonSkillNodes'
import { skillAreaItems } from '../SkillAreas'

// The content in this file is derived from the BSD-licensed content at
// tha
// See https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md for the license of that content

const CodeIntroSkillNodes = {
  $meta: {
    name: 'Intro to Coding',
    description: 'Learn the basics of the JavaScript programming language.',
  },
  comments: {
    $meta: {
      name: 'Comment your JavaScript Code',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  variables: {
    $meta: {
      name: 'Declare JavaScript Variables',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  positionImage: {
    $meta: {
      name: 'Positioning Sprites',
      icon: 'code',
      link: '/u/!vault/asset/eoTTDhibmKGrhuvHn',
      description: `Position an image with x, y and anchor point`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser', // for example
      ...C.E.$meta,
    },
  },
  // CONSOLIDATING WITH DECLARING VARIABLES AND DECLARING STRINGS

  // assignmentOperator: {
  //   $meta: {
  //     name: 'Storing Values with the Assignment Operator',
  //     icon: 'code',
  //     subsection: 'Numbers',
  //     ...C.E.$meta,
  //   },
  // },
  caseSensitiveVariables: {
    $meta: {
      name: 'Understanding Case Sensitivity in Variables',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // Name might change because combined with other math operations

  sumNumbers: {
    $meta: {
      name: 'Add Two Numbers with JavaScript',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATING WITH ADDING AND MULTIPLYING

  // divideNumbers: {
  //   $meta: {
  //     name: 'Divide One Number by Another with JavaScript',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },

  // Name of decrement might change because increment was added to the skill

  decrementNumbers: {
    $meta: {
      name: 'Decrement a Number with JavaScript',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WITH ADDING AND DIVIDING

  // multiplyDecimal: {
  //   $meta: {
  //     name: 'Multiply Two Decimals with JavaScript',
  //     icon: 'code',
  //     subsection: 'Numbers',
  //     ...C.E.$meta,
  //   },
  // },
  findingRemainder: {
    $meta: {
      name: 'Finding a Remainder in JavaScript',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WITH DECLARING VARIABLES AND ASSIGNMENT OPERATORS

  // declareString: {
  //   $meta: {
  //     name: 'Declare String Variables',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },

  // Name might change because combined wtih constructing string variables

  concatenatingStringPlus: {
    $meta: {
      name: 'Concatenating Strings with Plus Operator',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WITH CONCATENATING STRINGS

  // constructingStringVariables: {
  //   $meta: {
  //     name: 'Constructing Strings with Variables',
  //     icon: 'code',
  //     subsection: 'game 1',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  stringLength: {
    $meta: {
      name: 'Find the Length of a String',
      icon: 'code',
      subsection: 'Game 2', // temporary
      ...C.E.$meta,
    },
  },
  arrayVariable: {
    $meta: {
      name: 'Store Multiple Values in one Variable using JavaScript Arrays',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  arrayIndexes: {
    $meta: {
      name: 'Access Array Data with Indexes',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  modifyArray: {
    $meta: {
      name: 'Modify Array Data With Indexes',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  arrayPush: {
    $meta: {
      name: 'Manipulate Arrays With push()',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  arrayPop: {
    $meta: {
      name: 'Manipulate Arrays With pop()',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  arrayShift: {
    $meta: {
      name: 'Manipulate Arrays With shift()',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  arrayUnshift: {
    $meta: {
      name: 'Manipulate Arrays With unshift()',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  functionArguments: {
    $meta: {
      name: 'Passing Values to Functions with Arguments',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  globalScope: {
    $meta: {
      name: 'Global Scope and Functions',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  localScope: {
    $meta: {
      name: 'Local Scope and Functions',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  globalVsLocal: {
    $meta: {
      name: 'Global vs. Local Scope in Functions',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  returnValue: {
    $meta: {
      name: 'Return a Value from a Function with Return',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  assignmentReturnedValue: {
    $meta: {
      name: 'Assignment with a Returned Value',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  importCode: {
    $meta: {
      name: 'Import code from external file',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  standInLine: {
    $meta: {
      name: 'Stand in Line',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  booleans: {
    $meta: {
      name: 'Understanding Boolean Values',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WITH UNDERSTANDING BOOLEANS

  // ifStatement: {
  //   $meta: {
  //     name: 'Use Conditional Logic with If Statements',
  //     icon: 'code',
  //     subsection: 'Game 1',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },

  // Name might change because combined with inequality

  comparison: {
    $meta: {
      name: 'Comparison with the Equality Operator',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // COSOLIDATED WITH EQUALITY OPERATOR

  // comparisonInequeality: {
  //   $meta: {
  //     name: 'Comparison with the Inequality Operator',
  //     icon: 'code',
  //     subsection: 'Game 1',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },

  // Name might change because combined with other comparison operations

  greaterThan: {
    $meta: {
      name: 'Comparison with the Greater Than Operator',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WITH GREATER THAN

  // lessThanOr: {
  //   $meta: {
  //     name: 'Comparison with the Less Than Or Equal To Operator',
  //     icon: 'code',
  //     subsection: 'Game 1',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  logicalAnd: {
    $meta: {
      name: 'Comparisons with the Logical And Operator',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WTIH AND OPERATOR

  // logicalOr: {
  //   $meta: {
  //     name: 'Comparisons with the Logical Or Operator',
  //     icon: 'code',
  //     subsection: 'Game 1',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  elseStatement: {
    $meta: {
      name: 'Introducing Else Statements',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  elseIfStatement: {
    $meta: {
      name: 'Introducing Else If Statements',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  //  FOLLOWING 2 ARE CONSOLIDATED WITH INTRODUCING ELSE IF STATEMENTS

  // ifElseOrder: {
  //   $meta: {
  //     name: 'Logical Order in If Else Statements',
  //     icon: 'code',
  //     subsection: 'Game 1',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  // chainingIfElse: {
  //   $meta: {
  //     name: 'Chaining If Else Statements',
  //     icon: 'code',
  //     subsection: 'Game 1',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  golfCode: {
    $meta: {
      name: 'Golf Code',
      icon: 'code',
      subsection: 'Game 1',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  returnBoolean: {
    $meta: {
      name: 'Returning Boolean Values from Functions',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  countingCards: {
    $meta: {
      name: 'Counting Cards',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  objects: {
    $meta: {
      name: 'Build JavaScript Objects',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // Name might change because combined with accessing via bracket notation and variables

  objectsPropertiesDot: {
    $meta: {
      name: 'Accessing Objects Properties with the Dot Operator',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // FOLLOWING TO SKILLS COMBINED WITH ACCESSING PROPERTIES WITH DOT OPERATOR

  // objectsPropertiesBrackets: {
  //   $meta: {
  //     name: 'Accessing Objects Properties with Bracket Notation',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  // objectsPropertiesVariables: {
  //   $meta: {
  //     name: 'Accessing Objects Properties with Variables',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },

  // Name might change because combined with adding and deleting new properties

  updatingProperties: {
    $meta: {
      name: 'Updating Object Properties',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // FOLLOWING 2 SKILLS COMBINED WITH UPDATING OBJECT PROPERTIES

  // newProperty: {
  //   $meta: {
  //     name: 'Add New Properties to a JavaScript Object',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  // deleteProperties: {
  //   $meta: {
  //     name: 'Delete Properties from a JavaScript Object',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  forLoops: {
    $meta: {
      name: 'Iterate with JavaScript For Loops',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  oddNumbersIterate: {
    $meta: {
      name: 'Iterate Odd Numbers With a For Loop',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  countBackwardLoops: {
    $meta: {
      name: 'Count Backwards With a For Loop',
      icon: 'code',
      subsection: 'Game 2', // temporary
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  iterateArrayLoop: {
    $meta: {
      name: 'Iterate Through an Array with a For Loop',
      icon: 'code',
      subsection: 'Game 2',
      skillChallengeType: 'challenges', // temporary
      ...C.E.$meta,
    },
  },
}

export default CodeIntroSkillNodes
