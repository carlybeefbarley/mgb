import C from './CommonSkillNodes'

// The content in this file is derived from the BSD-licensed content at
// https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/seed/challenges/02-javascript-algorithms-and-data-structures/basic-javascript.json
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
      subsection: 'Comments',
      ...C.E.$meta,
    },
  },
  variables: {
    $meta: {
      name: 'Declare JavaScript Variables',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  assignmentOperator: {
    $meta: {
      name: 'Storing Values with the Assignment Operator',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  caseSensitiveVariables: {
    $meta: {
      name: 'Understanding Case Sensitivity in Variables',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  sumNumbers: {
    $meta: {
      name: 'Add Two Numbers with JavaScript',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  divideNumbers: {
    $meta: {
      name: 'Divide One Number by Another with JavaScript',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  decrementNumbers: {
    $meta: {
      name: 'Decrement a Number with JavaScript',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  multiplyDecimal: {
    $meta: {
      name: 'Multiply Two Decimals with JavaScript',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  findingRemainder: {
    $meta: {
      name: 'Finding a Remainder in JavaScript',
      icon: 'code',
      subsection: 'Numbers',
      ...C.E.$meta,
    },
  },
  declareString: {
    $meta: {
      name: 'Declare String Variables',
      icon: 'code',
      subsection: 'Strings',
      ...C.E.$meta,
    },
  },
  concatenatingStringPlus: {
    $meta: {
      name: 'Concatenating Strings with Plus Operator',
      icon: 'code',
      subsection: 'Strings',
      ...C.E.$meta,
    },
  },
  constructingStringVariables: {
    $meta: {
      name: 'Constructing Strings with Variables',
      icon: 'code',
      subsection: 'Strings',
      ...C.E.$meta,
    },
  },
  stringLength: {
    $meta: {
      name: 'Find the Length of a String',
      icon: 'code',
      subsection: 'Strings',
      ...C.E.$meta,
    },
  },
  arrayVariable: {
    $meta: {
      name: 'Store Multiple Values in one Variable using JavaScript Arrays',
      icon: 'code',
      subsection: 'Arrays',
      ...C.E.$meta,
    },
  },
  arrayIndexes: {
    $meta: {
      name: 'Access Array Data with Indexes',
      icon: 'code',
      subsection: 'Arrays',
      ...C.E.$meta,
    },
  },
  modifyArray: {
    $meta: {
      name: 'Modify Array Data With Indexes',
      icon: 'code',
      subsection: 'Arrays',
      ...C.E.$meta,
    },
  },
  arrayPush: {
    $meta: {
      name: 'Manipulate Arrays With push()',
      icon: 'code',
      subsection: 'Arrays',
      ...C.E.$meta,
    },
  },
  arrayPop: {
    $meta: {
      name: 'Manipulate Arrays With pop()',
      icon: 'code',
      subsection: 'Arrays',
      ...C.E.$meta,
    },
  },
  arrayShift: {
    $meta: {
      name: 'Manipulate Arrays With shift()',
      icon: 'code',
      subsection: 'Arrays',
      ...C.E.$meta,
    },
  },
  arrayUnshift: {
    $meta: {
      name: 'Manipulate Arrays With unshift()',
      icon: 'code',
      subsection: 'Arrays',
      ...C.E.$meta,
    },
  },
  functionArguments: {
    $meta: {
      name: 'Passing Values to Functions with Arguments',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  globalScope: {
    $meta: {
      name: 'Global Scope and Functions',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  localScope: {
    $meta: {
      name: 'Local Scope and Functions',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  globalVsLocal: {
    $meta: {
      name: 'Global vs. Local Scope in Functions',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  returnValue: {
    $meta: {
      name: 'Return a Value from a Function with Return',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  assignmentReturnedValue: {
    $meta: {
      name: 'Assignment with a Returned Value',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  importCode: {
    $meta: {
      name: 'Import code from external file',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  standInLine: {
    $meta: {
      name: 'Stand in Line',
      icon: 'code',
      subsection: 'Functions',
      ...C.E.$meta,
    },
  },
  booleans: {
    $meta: {
      name: 'Understanding Boolean Values',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  ifStatement: {
    $meta: {
      name: 'Use Conditional Logic with If Statements',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  comparison: {
    $meta: {
      name: 'Comparison with the Equality Operator',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  comparisonInequeality: {
    $meta: {
      name: 'Comparison with the Inequality Operator',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  greaterThan: {
    $meta: {
      name: 'Comparison with the Greater Than Operator',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  lessThanOr: {
    $meta: {
      name: 'Comparison with the Less Than Or Equal To Operator',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  logicalAnd: {
    $meta: {
      name: 'Comparisons with the Logical And Operator',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  logicalOr: {
    $meta: {
      name: 'Comparisons with the Logical Or Operator',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  elseStatement: {
    $meta: {
      name: 'Introducing Else Statements',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  elseIfStatement: {
    $meta: {
      name: 'Introducing Else If Statements',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  ifElseOrder: {
    $meta: {
      name: 'Logical Order in If Else Statements',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  chainingIfElse: {
    $meta: {
      name: 'Chaining If Else Statements',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  golfCode: {
    $meta: {
      name: 'Golf Code',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  returnBoolean: {
    $meta: {
      name: 'Returning Boolean Values from Functions',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  countingCards: {
    $meta: {
      name: 'Counting Cards',
      icon: 'code',
      subsection: 'Decision Making',
      ...C.E.$meta,
    },
  },
  objects: {
    $meta: {
      name: 'Build JavaScript Objects',
      icon: 'code',
      subsection: 'Objects',
      ...C.E.$meta,
    },
  },
  objectsPropertiesDot: {
    $meta: {
      name: 'Accessing Objects Properties with the Dot Operator',
      icon: 'code',
      subsection: 'Objects',
      ...C.E.$meta,
    },
  },
  objectsPropertiesBrackets: {
    $meta: {
      name: 'Accessing Objects Properties with Bracket Notation',
      icon: 'code',
      subsection: 'Objects',
      ...C.E.$meta,
    },
  },
  objectsPropertiesVariables: {
    $meta: {
      name: 'Accessing Objects Properties with Variables',
      icon: 'code',
      subsection: 'Objects',
      ...C.E.$meta,
    },
  },
  updatingProperties: {
    $meta: {
      name: 'Updating Object Properties',
      icon: 'code',
      subsection: 'Objects',
      ...C.E.$meta,
    },
  },
  newProperty: {
    $meta: {
      name: 'Add New Properties to a JavaScript Object',
      icon: 'code',
      subsection: 'Objects',
      ...C.E.$meta,
    },
  },
  deleteProperties: {
    $meta: {
      name: 'Delete Properties from a JavaScript Object',
      icon: 'code',
      subsection: 'Objects',
      ...C.E.$meta,
    },
  },
  forLoops: {
    $meta: {
      name: 'Iterate with JavaScript For Loops',
      icon: 'code',
      subsection: 'Loops',
      ...C.E.$meta,
    },
  },
  oddNumbersIterate: {
    $meta: {
      name: 'Iterate Odd Numbers With a For Loop',
      icon: 'code',
      subsection: 'Loops',
      ...C.E.$meta,
    },
  },
  countBackwardLoops: {
    $meta: {
      name: 'Count Backwards With a For Loop',
      icon: 'code',
      subsection: 'Loops',
      ...C.E.$meta,
    },
  },
  iterateArrayLoop: {
    $meta: {
      name: 'Iterate Through an Array with a For Loop',
      icon: 'code',
      subsection: 'Loops',
      ...C.E.$meta,
    },
  },
}

export default CodeIntroSkillNodes
