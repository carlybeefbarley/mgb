import _ from 'lodash'
import React, { PropTypes } from 'react'
import { hasSkill } from '/imports/schemas/skills'
import { isSkillKeyValid } from '/imports/Skills/SkillNodes/SkillNodes.js'

import Thumbnail from '/client/imports/components/Assets/Thumbnail'
import SpecialGlobals from '/imports/SpecialGlobals'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// TODO - embed/link to MDN docs using https://developer.mozilla.org/en-US/docs/MDN/Contribute/Tools/Document_parameters
//    for example
//    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators$toc#Equality_()
//    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators?raw&macros&section=Equality_operators
//    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators?raw&macros&section=Equality_()
// Maybe do this in SkillNodes.js ?

// TODO: I could improve Object properties.. any property right now
//       implies the object skill  .. That could be better

// Some external links that aren't part of the wider helpInfo list. I put them here for easier maintenance
const _mdnJsRef = 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/'
var xlinks = {
  jsDoc: 'http://usejsdoc.org/about-getting-started.html',
  regexper: 'https://regexper.com/#', // takes a URIencoded Regex as a # suffix
  ecma6: 'https://github.com/lukehoban/es6features#readme',
  mdnLet: _mdnJsRef + 'Statements/let',
  mdnVar: _mdnJsRef + 'Statements/var',
  react: 'https://facebook.github.io/react/',
}

// For these Token types, render nothing at all
const noHelpTypes = [
  null,
  // "variable"
]

// Indexes into the SkillNodes object defined in /imports/Skills/SkillNodes/SkillNodes.js
const _skl = 'code.js.lang.'

// For these Token types, use a special renderer, and don't use the normal HelpInfo structure
const specialHelpTypes = {
  variable: {
    renderFn: specialHandlerGlobalVariable,
    skillNodes: _skl + 'scope.global',
    betterTypeName: 'Global Variable',
  },
  'variable-2': {
    renderFn: specialHandlerLocalVariable,
    skillNodes: _skl + 'scope.local',
    betterTypeName: 'Local Variable',
  },
  // Note that there is TODO for scope.local-execution (i.e. var) and scope.local-block (i.e. let/const)

  'string-2': {
    renderFn: specialHandlerString2,
    skillNodes: _skl + 'types.regex',
    betterTypeName: 'Regular Expression',
  },
  comment: {
    renderFn: specialHandlerComment,
    skillNodes: _skl + 'comments',
    betterTypeName: specialHandlerCommentTitle,
    showTokenStringInTitle: false,
  },
  def: { renderFn: specialHandlerDef, skillNodes: null, betterTypeName: 'Definition' },
}

// TODO: TokenType='variable-2' is LOCAL and TokenType='variable' is global.

const helpInfo = [
  // jsx <
  {
    tt: 'tag bracket',
    ts: '<',
    origin: 'jsx',
    skillNodes: _skl + 'jsx.startOpenTagBracket',
    help:
      'This is used to mark JSX/html Tags. JSX is a popular extension to JavaScript used when programming in ReactJS',
    advice: 'The < here indicates the beginning of an opening JSX/html tag for a component/element',
    url: xlinks.react,
  },
  // jsx >
  {
    tt: 'tag bracket',
    ts: '>',
    origin: 'jsx',
    skillNodes: _skl + 'jsx.closeTagBracket',
    help:
      'This is used to mark JSX/html Tags. JSX is a popular extension to JavaScript used when programming in ReactJS',
    advice: 'The > here indicates the end of a JSX/html tag for a component/element',
    url: xlinks.react,
  },

  // jsx </
  {
    tt: 'tag bracket',
    ts: '</',
    origin: 'jsx',
    skillNodes: _skl + 'jsx.startClosingTagBracket',
    help:
      'This is used to mark JSX/html Tags. JSX is a popular extension to JavaScript used when programming in ReactJS',
    advice: 'The </ here indicates the start of a closing JSX/html tag for a component/element',
    url: xlinks.react,
  },

  // jsx />
  {
    tt: 'tag bracket',
    ts: '/>',
    origin: 'jsx',
    skillNodes: _skl + 'jsx.endSelfClosingTagBracket',
    help:
      'This is used to mark JSX/html Tags. JSX is a popular extension to JavaScript used when programming in ReactJS',
    advice: 'The /> here indicates the end of a self-closing JSX/html tag for a component/element',
    url: xlinks.react,
  },

  // this
  {
    tt: 'keyword',
    ts: 'this',
    origin: 'ecma5',
    skillNodes: _skl + 'this',
    help:
      "this is a keyword, but acts like a special read-only variable which can be used inside functions to access 'relevant' information. In most cases, the value of 'this' is determined by how a function is called. It can't be set when it is called, and it may be different each time the function is called",
    advice:
      "Javascript is mostly a simple to learn language, but 'this' is the really quirky part that can confuse learners.",
    advice2:
      "It is well worth sitting down and reading the page on 'this' once a week/month until you really understand it!",
    url: _mdnJsRef + 'Operators/this',
  },

  // property
  {
    tt: 'property',
    ts: null,
    origin: 'ecma5',
    skillNodes: _skl + 'types.object',
    help:
      'JavaScript is designed on a simple object-based paradigm. An object is a collection of properties, and a property is an association between a name (or key) and a value.',
    advice: "A property's value can be a function, in which case the property is known as a method",
    advice2: 'Unassigned properties of an object are undefined (and not null).',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects',
  },

  // number
  {
    tt: 'number',
    ts: null,
    origin: 'ecma5',
    skillNodes: _skl + 'types.number',
    help:
      'A number represents a numeric value. Unlike other languages which have different types for supporting integers, floating point numbers etc; Javascript uses the single Number type for all kinds of numeric values',
    advice:
      'A Javascript Number can safely represent values as low as -(2^53 - 1) and as high as (2^53 - 1).',
    advice2:
      'There are some special values like Number.NaN. Number.NEGATIVE_INFINITY and Number.POSITIVE_INFINITY that are used in specific mathemtaical circumstances',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
  },

  // string
  {
    tt: 'string',
    ts: null,
    origin: 'ecma5',
    skillNodes: _skl + 'types.string',
    help:
      'A string is a sequence of characters. Strings have a special property .length which represents the number of characters in the string.',
    advice:
      'A string can be bounded by (starts & ends with) either a single quote (\'), a double quote (") or a backquote (`). The backquote variant is knows as a Template Literal. Each of those three ways to create string literals has some specific features.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
    url2: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals',
  },

  // function & return

  {
    tt: 'keyword',
    ts: 'function',
    origin: 'ecma5',
    skillNodes: _skl + 'functions.function',
    help: 'Defines a function - as a statement. or inside an expression',
    syntax: 'function [optionalFunctionName]([param1[, param2[, ..., paramN]]]) { statements }',
    advice: 'Note that functions can be defined using a statement or an operator (function expression)',
    url: _mdnJsRef + 'Operators/function',
    url2: _mdnJsRef + 'Statements/function',
  },

  {
    tt: 'keyword',
    ts: 'return',
    origin: 'ecma5',
    skillNodes: _skl + 'functions.return',
    help: 'ends function execution and (optionally) specifies a value to be returned to the function caller',
    advice:
      'A function can have multiple places where it can return a value. It is usually wiser to avoid having too many returns in a single function because it can make the code harder to understand. ',
    advice2:
      'If no return value is provided, this will cause the function will return the special value  undefined. A function will implicitly return undefined when it reaches the end of the code in the function',
    url: _mdnJsRef + 'Statements/return',
  },

  // Declarations  var, const, let

  {
    tt: 'keyword',
    ts: 'var',
    origin: 'ecma5',
    skillNodes: _skl + 'statements.var',
    help: 'Defines a variable using global or function scope',
    advice:
      "Unlike other languages like C, Java or python, 'var' in JavaScript does not use 'block scope'. In future, the EcmaScript 6 keywords 'const' and 'let' will support block scope",
    url: _mdnJsRef + 'Statements/var',
    url2: 'https://developer.mozilla.org/docs/Web/JavaScript/Closures',
  },

  {
    tt: 'keyword',
    ts: 'const',
    origin: 'ecma6',
    skillNodes: _skl + 'statements.const',
    help: 'defines a variable that is not intended to change',
    advice:
      'creates a read-only reference to a value. It does not mean the value it holds is immutable, just that the variable identifier cannot be reassigned.',
    advice2: "Note that const is block-scoped, like 'let'",
    url: _mdnJsRef + 'Statements/const',
  },

  {
    tt: 'keyword',
    ts: 'let',
    origin: 'ecma6',
    skillNodes: _skl + 'statements.let',
    help: 'declares a block scope local variable, optionally initializing it to a value.',
    advice:
      "The scope of 'let' is different to 'var' - 'var' defines a variable either globally, or locally to an entire function regardless of block scope",
    url: _mdnJsRef + 'Statements/let',
  },

  // Special value properties  Infinity, NaN, undefined, null ; true, false

  {
    tt: 'atom',
    ts: 'Infinity',
    origin: 'ecma5',
    skillNodes: _skl + 'math.constants.Infinity',
    help:
      'The global Infinity property is a numeric value representing infinity. The value Infinity (positive infinity) is greater than any other number. This value behaves mathematically like infinity. For example, any positive number multiplied by Infinity is Infinity, anything divided by Infinity is 0, anything divided by 0 is Infinity',
    url: _mdnJsRef + 'Global_Objects/Infinity',
  },

  {
    tt: 'atom',
    ts: 'NaN',
    origin: 'ecma5',
    skillNodes: _skl + 'math.constants.NaN',
    help:
      'NaN is a special property representing Not-A-Number. It is rather rare to use NaN in a program. It is the returned value when Math functions fail (Math.sqrt(-1)) or when a function trying to parse a number fails (parseInt("blabla"))',
    url: _mdnJsRef + 'Global_Objects/NaN',
  },

  {
    tt: 'atom',
    ts: 'undefined',
    origin: 'ecma5',
    skillNodes: _skl + 'math.statements.undefined',
    help:
      'A variable that has not been assigned a value is of type undefined. A method or statement also returns undefined if the variable that is being evaluated does not have an assigned value. A function returns undefined if a value was not returned',
    url: _mdnJsRef + 'Global_Objects/undefined',
  },

  {
    tt: 'atom',
    ts: 'null',
    origin: 'ecma5',
    skillNodes: _skl + 'math.statements.NaN',
    help: 'null is often used as a value when an object is expected but none is found/relevant',
    advice:
      'null has some surprising behaviors/bugs. For example (null == undefined) evaluates to true and (typeof null) evaluates to object',
    url: _mdnJsRef + 'Global_Objects/null',
  },

  {
    tt: 'atom',
    ts: 'true',
    origin: 'ecma5',
    skillNodes: _skl + 'booleans.true',
    help: "This is the special boolean value 'true'",
    url: _mdnJsRef + 'Global_Objects/Boolean', // Not the best link?
  },

  {
    tt: 'atom',
    ts: 'false',
    origin: 'ecma5',
    skillNodes: _skl + 'booleans.false',
    help: "This is the special boolean value 'false'",
    url: _mdnJsRef + 'Global_Objects/Boolean', // Not the best link?
  },

  // Class-related

  {
    tt: 'keyword',
    ts: 'class',
    origin: 'ecma6',
    skillNodes: _skl + 'classes.class',
    help:
      'A class is a way to collect related functions and properties for an object type together, and make it easy to create instances of that class, and create new classes that inherit capabilities from a parent class',
    advice:
      'JavaScript classes use prototype-based inheritance. This is subtly different than how classes work in languages like C++, python and Java',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes',
    url2: _mdnJsRef + 'Statements/class',
    url3: _mdnJsRef + 'Operators/class',
  },

  {
    tt: 'keyword',
    ts: 'super',
    origin: 'ecma6',
    skillNodes: _skl + 'classes.super',
    help: "The super keyword is used to call functions on an object's parent",
    advice:
      'When used in a constructor, the super keyword appears alone and must be used before the this keyword can be used',
    url: _mdnJsRef + 'Operators/super',
  },

  {
    tt: 'keyword',
    ts: 'new',
    origin: 'ecma5',
    skillNodes: _skl + 'classes.new',
    help: 'The new operator creates an instance of an object that has a constructor function',
    advice:
      "The object being new'ed can be a user-defined object type or of one of the built-in object types that has a constructor function",
    url: _mdnJsRef + 'Operators/new',
  },

  // Fancy function argument and return stuff - yield  ...

  {
    tt: 'keyword',
    ts: 'yield',
    origin: 'ecma6',
    skillNodes: _skl + 'generators.yield',
    syntax: '[optionalReturnValue] = yield [expression]',
    help: 'The yield keyword is used to pause and resume a generator function',
    url: _mdnJsRef + 'Operators/yield',
    url2: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*',
  },

  {
    tt: 'meta',
    ts: '...',
    origin: 'ecma6',
    skillNodes: _skl + 'operator.spread',
    help:
      'The spread operator allows an expression to be expanded in places where multiple arguments (for function calls) or multiple elements (for array literals) are expected.',
    url: _mdnJsRef + 'Operators/Spread_operator',
  },

  {
    tt: 'operator',
    ts: '=>',
    origin: 'ecma6',
    skillNodes: _skl + 'functions.arrow-functions',
    help:
      "An arrow function expression has a shorter syntax compared to function expressions and lexically binds the 'this' value (does not bind its own 'this', arguments, super, or new.target).",
    help2: 'Arrow functions are always anonymous (i.e. they cannot have a name)',
    advice: '=> is sometime confused with >= (greater-than-or-equal)',
    advice2: "Some people call these 'fat arrow functions'",
    url: _mdnJsRef + 'Functions/Arrow_functions',
  },

  {
    tt: 'variable-2',
    ts: 'arguments',
    origin: 'ecma5',
    skillNodes: _skl + 'functions.arguments-object',
    help: 'The arguments object is an Array-like object corresponding to the arguments passed to a function',
    help2: 'The arguments object is a local variable available within all functions',
    advice2:
      "This object contains an entry for each argument passed to the function, the first entry's index starting at 0",
    url: _mdnJsRef + 'Functions/arguments',
    url2: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
  },

  // ++ and --

  {
    tt: 'operator',
    ts: '++',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.plusplus',
    help: 'The increment operator increments (adds one to) its operand and returns a value',
    advice:
      'If used postfix, with operator after operand (for example, x++), then it returns the value before incrementing',
    advice2:
      'If used prefix with operator before operand (for example, ++x), then it returns the value after incrementing',
    url: _mdnJsRef + 'Operators/Arithmetic_Operators#Increment',
  },

  {
    tt: 'operator',
    ts: '--',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.minusminus',
    help: 'The decrement operator decrements (subtracts one from) its operand and returns a value',
    advice:
      'If used postfix, with operator after operand (for example, x--), then it returns the value before decrementing',
    advice2:
      'If used prefix with operator before operand (for example, --x), then it returns the value after decrementing',
    url: _mdnJsRef + 'Operators/Arithmetic_Operators#Decrement',
  },

  // Simple Math operators   + - * / %

  {
    tt: 'operator',
    ts: '+',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.plus',
    help:
      'With two numeric operands, (for example x + y) the addition operator produces the sum of numeric operands',
    help2:
      'With two string operands (for example "Mrs " + familyName) it will concatenate (join) two strings',
    advice: 'String + Number and Number + string are both treated as string concatenation',
    advice2:
      'Watch out! Boolean + number is treated as addition, but String + boolean is treated as concatenation!',
    url: _mdnJsRef + 'Operators/Arithmetic_Operators#Addition',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Unary_plus',
  },

  {
    tt: 'operator',
    ts: '-',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.minus',
    help: 'The subtraction operator subtracts the two operands, producing their difference',
    help2:
      "Both operands must be numbers, otherwise the result will be NaN (special Javascript for 'Not a Number')",
    url: _mdnJsRef + 'Operators/Arithmetic_Operators#Subtraction',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Unary_negation',
  },

  {
    tt: 'operator',
    ts: '*',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.asterisk',
    help: "The multiplication operator multiplies the two operands, producing their 'mathematical product'",
    help2:
      "Both operands must be numbers, otherwise the result will be NaN (special Javascript for 'Not a Number')",
    advice:
      'Multiplying with Infinity is interesting:  Infinity * 0  === NaN  and Infinity * Infinity === Infinity',
    url: _mdnJsRef + 'Operators/Arithmetic_Operators#Multiplication',
  },

  {
    tt: 'operator',
    ts: '/',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.slash',
    help:
      'The division operator provides the result of dividing the left-hand operand by the right-hand operand',
    help2:
      'Put more mathematically, / produces the quotient of its operands where the left operand is the dividend and the right operand is the divisor',
    advice:
      'Division can result in Infinity or -Infinity as a result. For example 2.0 / -0.0 === -Infinity in JavaScript',
    advice2:
      'Note that the / character is often used for many other purposes in JavaScript programs. For comments it is used in /* and // and */. It is also used in regular expressions, as a separator in urls and in file paths',
    url: _mdnJsRef + 'Operators/Arithmetic_Operators#Division',
  },

  {
    tt: 'operator',
    ts: '%',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.percent',
    help: 'Remainder (%)',
    help2:
      'The remainder operator returns the remainder left over when one operand is divided by a second operand',
    advice:
      'Note that remainder is NOT the same as mathematical modulo operation..  a modulo operator result would take the sign of the divisor, not the dividend.',
    url: _mdnJsRef + 'Operators/Arithmetic_Operators#Remainder',
  },

  // typeof, instanceof, void, delete, in

  {
    tt: 'keyword',
    ts: 'typeof',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.typeof',
    help: 'The typeof operator returns a string indicating the type of the unevaluated operand',
    url: _mdnJsRef + 'Operators/typeof',
  },

  {
    tt: 'keyword',
    ts: 'instanceof',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.instanceof',
    help:
      'The instanceof operator tests whether an object has in its prototype chain the prototype property of a constructor',
    advice:
      'There can be some funky behaviors using instanceof across multiple contexts (frames, windows etc).',
    advice2: 'Read the API docs linked below if things are behaving strangely',
    syntax: 'objectToTest instanceof constructorFunction',
    url: _mdnJsRef + 'Operators/instanceof',
  },

  {
    tt: 'keyword',
    ts: 'void',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.void',
    help: 'The void operator evaluates the given expression and then returns undefined',
    advice:
      'void allows inserting expressions that produce side effects into places where an expression that evaluates to undefined is desired',
    url: _mdnJsRef + 'Operators/void',
  },

  {
    tt: 'keyword',
    ts: 'delete',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.delete',
    help: 'The delete operator removes a property from an object',
    help2:
      "delete is only effective on an object's properties. It has no effect on variable or function names",
    advice:
      'Unlike other languages such as Java or Python, the Javascript delete operator has nothing to do with directly freeing memory. it only does so indirectly via breaking references)',
    advice2:
      'When you delete an array element, the array length is NOT affected. This holds even if you delete the last element of the array',
    url: _mdnJsRef + 'Operators/delete',
    url2: 'http://perfectionkills.com/understanding-delete/',
  },

  {
    tt: 'keyword',
    ts: 'in',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.in', // TODO: can we contextually disambigaute cases?

    syntax: `property in objectName
..or...
for (let x in obj)`,
    help:
      'If used in an expression, the in operator returns true if the specified property is in the specified object',
    help2:
      'If used in a for...in loop, the in operator describes that the for loop should iterate over the properties of the object',
    advice: 'The in operator returns true for properties in the prototype chain',
    advice2: "If this isn't working how you expect, take a look at obj.hasOwnProperty(prop) instead",
    url: _mdnJsRef + 'Operators/in',
    url2: _mdnJsRef + 'Global_Objects/Object/hasOwnProperty',
    url3: _mdnJsRef + 'Statements/for...in',
  },

  // The conditional/ternary operator   ? :  (TODO :why is there a keyword _AND_ operator tokentype?)
  // TODO: What about ":" .. i.e. the ternary operand separator
  {
    tt: 'keyword',
    ts: '?',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.questionmark', // Operator? or for this context. keyword?
    syntax: 'conditionToTest ? expressionEvaluatedIfTrue : expressionEvaluatedIfFalse',
    help:
      'If conditionToTest is true, the operator returns the value of expressionEvaluatedIfTrue; otherwise, it returns the value of expressionEvaluatedIfFalse',
    help2: 'This operator is frequently used as a shortcut for the if statement',
    advice: 'The conditional (ternary) operator is the ONLY JavaScript operator that takes three operands.',
    url: _mdnJsRef + 'Operators/Conditional_Operator',
  },

  {
    tt: 'operator',
    ts: '?',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.questionmark',
    syntax: 'conditionToTest ? expressionEvaluatedIfTrue : expressionEvaluatedIfFalse',
    help:
      'If conditionToTest is true, the operator returns the value of expressionEvaluatedIfTrue; otherwise, it returns the value of expressionEvaluatedIfFalse',
    help2: 'This operator is frequently used as a shortcut for the if statement',
    advice: 'The conditional (ternary) operator is the ONLY JavaScript operator that takes three operands.',
    url: _mdnJsRef + 'Operators/Conditional_Operator',
  },

  // The comma operator   ,
  // TODO: NOTE THAT codemirror can't really get this token at present so don't worry too much

  {
    tt: 'operator',
    ts: ',',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.comma',
    syntax: 'expr1, expr2, expr3...',
    help:
      'The comma operator evaluates each of its operands (from left to right) and returns the value of the last operand',
    advice2:
      'The comma character is used in other contexts as a separator (arrays, objects), and as part of the for loop syntax',
    url: _mdnJsRef + 'Operators/Comma_Operator',
    url2: _mdnJsRef + 'Statements/for',
  },

  // Bitwise operators  ~ & | ^ << >> >>>

  {
    tt: 'operator',
    ts: '~',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.tilde-bitwise-not',
    help: '~ is Bitwise NOT',
    help2:
      "This operation performs the NOT operator on each bit. NOT myVal yields the inverted value (a.k.a. one's complement) of myVal",
    url: _mdnJsRef + 'Operators/Bitwise_Operators#Bitwise_NOT',
    url2: _mdnJsRef + 'Operators/Bitwise_Operators',
  },

  {
    tt: 'operator',
    ts: '&',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.ampersand-bitwise-and',
    help: '& is Bitwise AND',
    help2:
      'This operation performs the AND operation on each pair of bits. a AND b yields 1 only if both a and b are 1',
    url: _mdnJsRef + 'Operators/Bitwise_Operators#(Bitwise_AND)',
    url2: _mdnJsRef + 'Operators/Bitwise_Operators',
  },

  {
    tt: 'operator',
    ts: '|',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.pipe-bitwise-or',
    help: '| is Bitwise OR',
    help2:
      'This operation performs the OR operation on each pair of bits. a OR b yields 1 if either a or b is 1',
    url: _mdnJsRef + 'Operators/Bitwise_Operators#(Bitwise_OR)',
    url2: _mdnJsRef + 'Operators/Bitwise_Operators',
  },

  {
    tt: 'operator',
    ts: '^',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.caret-bitwise-xor',
    help: '^ is Bitwise XOR.   This is NOT THE POWER OPERATOR, for that use Math.pow()',
    help2:
      'This operation performs the XOR operation on each pair of bits. a XOR b yields 1 if a and b are different',
    advice: 'In Javascript, 4^4 === 0',
    advice2: 'For exponentiation, it is best to use Math.pow()',
    url: _mdnJsRef + 'Operators/Bitwise_Operators#(Bitwise_XOR)',
    url2: _mdnJsRef + 'Global_Objects/Math/pow',
  },

  {
    tt: 'operator',
    ts: '<<',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.lessless-bitwise-shift-left',
    help:
      '<< is the Left shift operator. This operator shifts the first operand the specified number of bits to the left. Excess bits shifted off to the left are discarded. Zero bits are shifted in from the right',
    url: _mdnJsRef + 'Operators/Bitwise_Operators#<<_(Left_shift)',
    url2: _mdnJsRef + 'Operators/Bitwise_Operators',
  },

  {
    tt: 'operator',
    ts: '>>',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.greatergreater-bitwise-shift-right',
    help:
      '>> is Sign-propagating right shift. This operator shifts the first operand the specified number of bits to the right. Excess bits shifted off to the right are discarded',
    help2:
      "Copies of the leftmost bit are shifted in from the left. Since the new leftmost bit has the same value as the previous leftmost bit, the sign bit (the leftmost bit) does not change. Hence the name 'sign-propagating'",
    url: _mdnJsRef + 'Operators/Bitwise_Operators#>>_(Sign-propagating_right_shift)',
    url2: _mdnJsRef + 'Operators/Bitwise_Operators',
  },

  {
    tt: 'operator',
    ts: '>>>',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.greatergreatergreater-bitwise-zero-fill-shift-right',
    help: '>>> is Zero-fill right shift',
    help2:
      'This operator shifts the first operand the specified number of bits to the right. Excess bits shifted off to the right are discarded. Zero bits are shifted in from the left. The sign bit becomes 0, so the result is always non-negative.',
    url: _mdnJsRef + 'Operators/Bitwise_Operators#>>>_(Zero-fill_right_shift))',
    url2: _mdnJsRef + 'Operators/Bitwise_Operators',
  },

  // Logical operators !, &&, ||

  {
    tt: 'operator',
    ts: '!',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.bang-logical-not',

    help:
      "This is the logical operator 'NOT' which acts on an expression that follows it. It converts true to false, and false to true. For example !false === true",
    url: _mdnJsRef + 'Operators/Logical_Operators#Logical_NOT',
    url2: _mdnJsRef + 'Global_Objects/Boolean',
  },

  {
    tt: 'operator',
    ts: '&&',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.ampersandampersand-logical-and',
    help:
      "Logical 'AND': returns true if both the left hand AND right side are true. Note that the right-hand side is only evaluated if the left hand side is true",
    url: _mdnJsRef + 'Operators/Logical_Operators#Logical_AND_()',
    url2: _mdnJsRef + 'Global_Objects/Boolean',
  },

  {
    tt: 'operator',
    ts: '||',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.pipepipe-logical-or',
    help:
      "Logical 'or': returns true if either the left hand OR right side are true. Note that the right-hand side is only evaluated if the left hand side is false",
    url: _mdnJsRef + 'Operators/Logical_Operators#Logical_OR_()',
    url2: _mdnJsRef + 'Global_Objects/Boolean',
  },

  // Assignment operators

  {
    tt: 'operator',
    ts: '=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.equals-assignment',
    help:
      "The Assignment operator '=' assigns the value on the right to the variable or property on the left",
    advice:
      'When assigning arrays or objects to values, it does not create a copy, = just adds a new reference to the existing object/array',
    advice2:
      'Chaining the assignment operator is possible in order to assign a single value to multiple variables. for example x = y = 2',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Assignment',
  },

  {
    tt: 'operator',
    ts: '+=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.plusequals-addition-assignment',
    syntax: 'valueToBeChanged += valueToBeAddedOrConcatenated',
    help:
      'The addition assignment operator adds the value of the right operand to a variable and assigns the result to the variable',
    help2:
      'Depending on whether the operands are numbers or strings, the operation might be mathematical addition or string concatenation (joining)',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x+=y+=z, but you would be pretty crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Addition_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Addition',
  },

  {
    tt: 'operator',
    ts: '-=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.minusequals-subtraction-assignment',
    syntax: 'valueToBeChanged -= valueToBeSubtracted',
    help:
      'The subtraction assignment operator subtracts the value of the right operand from a variable and assigns the result to the variable',
    help2: 'Both operands should be numbers, otherwise the result will be NaN (Not a Number)',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x-=y-=z, but you would be pretty crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Subtraction_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Subtraction',
  },

  {
    tt: 'operator',
    ts: '*=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.asteriskequals-multiplication-assignment',
    syntax: 'valueToBeChanged *= valueToBeMultipliedBy',
    help:
      'The multiplication assignment operator multiplies a variable by the value of the right operand and assigns the result to the variable',
    help2: 'Both operands should be numbers, otherwise the result will be NaN (Not a Number)',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x*=y*=z, but you would be pretty crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Multiplication_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Multiplication',
  },

  {
    tt: 'operator',
    ts: '/=',
    origin: 'ecma5',
    syntax: 'valueToBeChanged /= valueToBeDividedBy',
    skillNodes: _skl + 'operators.slashequals-division-assignment',
    help:
      'The division assignment operator divides a variable by the value of the right operand and assigns the result to the variable',
    help2: 'Both operands should be numbers, otherwise the result will be NaN (Not a Number)',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x/=y/=z, but you would be pretty crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Division_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Division',
  },

  {
    tt: 'operator',
    ts: '%=',
    origin: 'ecma5',
    syntax: 'valueToBeChanged %= valueToBeRemainderedBy',
    skillNodes: _skl + 'operators.percentequals-remainder-assignment',
    help:
      'The remainder assignment operator divides a variable by the value of the right operand and assigns the REMAINDER to the variable',
    help2: 'Both operands should be numbers, otherwise the result will be NaN (Not a Number)',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x%=y%=z, but you would be pretty crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Remainder_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Remainder',
  },
  {
    tt: 'operator',
    ts: '<<=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.',
    syntax: 'valueToBeChanged <<= bitsToBeLeftShiftedBy',
    help:
      'The left shift assignment operator moves the specified amount of bits to the left and assigns the result to the variable',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x<<=y<<=z, but you would be pretty crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Left_shift_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Left_shift',
  },

  {
    tt: 'operator',
    ts: '>>=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.',
    syntax: 'valueToBeChanged >>= bitsToBeRightShiftedBy',
    help:
      'The right shift assignment operator moves the specified amount of bits to the right and assigns the result to the variable',
    help2:
      'This is a sign-propagating right shift: This operator shifts the first operand the specified number of bits to the right. Excess bits shifted off to the right are discarded. Copies of the leftmost bit are shifted in from the left',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x>>=y>>=z, but you would be pretty crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Right_shift_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Right_shift',
  },

  {
    tt: 'operator',
    ts: '>>>=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.',
    syntax: 'valueToBeChanged >>>= bitsToBeRightShiftedBy',
    help:
      'The unsigned right shift assignment operator moves the specified amount of bits to the right and assigns the result to the variable',
    help2:
      'This is a zero-fill right shift: This operator shifts the first operand the specified number of bits to the right. Excess bits shifted off to the right are discarded. Zero bits are shifted in from the left. The sign bit becomes 0, so the result is always non-negative',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x>>>=y>>>=z, but you would be completely crazy to do this',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Unsigned_right_shift_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Unsigned_right_shift',
  },

  {
    tt: 'operator',
    ts: '&=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.',
    syntax: 'valueToBeChanged &= bitsToBeAndedWith',
    help:
      'The bitwise AND assignment operator uses the binary representation of both operands, does a bitwise AND operation on them and assigns the result to the variable',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x&=y&=z, but you would be completely crazy to do this',
    advice2: "There is no Logical AND assignment operator in Javascript, so don't go trying val&&=val2",
    url: _mdnJsRef + 'Operators/Assignment_Operators#Bitwise_AND_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Bitwise_AND',
  },

  {
    tt: 'operator',
    ts: '^=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.',
    syntax: 'valueToBeChanged ^= bitsToBeXoredWith',
    help:
      'The bitwise XOR assignment operator uses the binary representation of both operands, does a bitwise XOR operation on them and assigns the result to the variable',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x^=y^=z, but you would be completely crazy to do this',
    advice2:
      'This is not for Powers/Exponents. use Math.pow() if you want something like x-to-the-power-of-y',
    url: _mdnJsRef + 'Operators/Assignment_Operators#Bitwise_XOR_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Bitwise_XOR',
  },

  {
    tt: 'operator',
    ts: '|=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.',
    syntax: 'valueToBeChanged |= bitsToBeOredWith',
    help:
      'The bitwise OR assignment operator uses the binary representation of both operands, does a bitwise OR operation on them and assigns the result to the variable',
    advice:
      'Assignment operations return the assigned value, so it is possible chain them such as x|=y|=z, but you would be very crazy to do this',
    advice2: "There is no Logical OR assignment operator in Javascript, so don't go trying val||=val2",
    url: _mdnJsRef + 'Operators/Assignment_Operators#Bitwise_OR_assignment',
    url2: _mdnJsRef + 'Operators/Arithmetic_Operators#Bitwise_OR',
  },

  // Comparison operators https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Comparison_Operators#Equality

  {
    tt: 'operator',
    ts: '==',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.equality',
    help:
      'The equality operator converts the left and right values if they are not of the same type, then applies strict comparison. If both operands are objects, then JavaScript compares internal references which are equal when operands refer to the same object in memory.',
    advice:
      'It is safer to use === unless you REALLY understand why == is more correct in your particular case',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Equality',
  },

  {
    tt: 'operator',
    ts: '!=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.inequality',
    help:
      'The Inequality operator returns true if the left and right values are not equal: they must be of the same type and the contents must match',
    advice:
      'It is safer to use !== unless you REALLY understand why != is more correct in your particular case',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Identity_strict_equality_()',
  },

  {
    tt: 'operator',
    ts: '===',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.identity-equality',
    help:
      'The IDENTITY equality operator returns true if the left and right values are strictly equal: they must be of the same type and the contents must match',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Identity_strict_equality_()',
  },

  {
    tt: 'operator',
    ts: '!==',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.identity-inequality',
    help:
      'The NON-IDENTITY operator returns true if the left and right values are not of the same type and/or are not equal',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Non-identity_strict_inequality_(!)',
  },

  // Relational operators https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Comparison_Operators#Relational_operators

  {
    tt: 'operator',
    ts: '<',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.less-than',
    help: 'return true if left hand value is less than right hand value',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Less_than_operator',
  },

  {
    tt: 'operator',
    ts: '<=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.less-than-or-equal',
    help: 'return true if left hand value is less than or equal to the right hand value',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Less_than_or_equal_operator',
  },

  {
    tt: 'operator',
    ts: '>=',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.greater-than-or-equal',
    help: 'return true if left hand value is greater than or equal to the right hand value',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Greater_than_or_equal_operator',
  },

  {
    tt: 'operator',
    ts: '>',
    origin: 'ecma5',
    skillNodes: _skl + 'operators.greater-than',
    help: 'return true if left hand value is greater than right hand value',
    url: _mdnJsRef + 'Operators/Comparison_Operators#Greater_than_operator',
  },

  //////////////////  // TODO(@dgolds):  Continue with skillNodes: from here
  // Control flow    if..else    switch..case    while ()   do...while()   break    continue

  {
    tt: 'keyword',
    ts: 'if',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.if',
    syntax: 'if (condition) statementIfTrue [else optionalStatementIfFalse]',
    help: 'The if statement executes a statement if a specified condition is true',
    help2: 'If the condition is false, another statement can be executed',
    url: _mdnJsRef + 'Statements/if...else',
  },
  {
    tt: 'keyword',
    ts: 'else',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.else',
    syntax: 'if (condition) statementIfTrue [else optionalStatementIfFalse]',
    help: 'The if statement executes a statement if a specified condition is true',
    help2: "If the condition is false, another statement can be executed using 'else'",
    url: _mdnJsRef + 'Statements/if...else',
  },

  {
    tt: 'keyword',
    ts: 'switch',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.switch',
    syntax: `switch (expression) {
  case value1:
    // Statements executed when the result of
    // expression matches value1
    break;  // Optional - stops fall-through to next case
  case value2:
    // Statements executed when the result of
    // expression matches value2
    break;  // Optional - stops fall-through to next case
 ...
  case valueN:
    // Statements executed when the result of
    // expression matches valueN
    break;  // Optional - stops fall-through to next case
  default:  // Optional - don't have to provid default
    // Statements executed when none of the
    // values match the value of the expression
    break;  // Optional - doesn't do much for last case/default
}`,
    help:
      "The switch..case statement evaluates an expression, matching the expression's value to a case clause, and executes statements associated with the matching case",
    help2: 'If the condition is false, another statement can be executed',
    advice:
      'break statements are used to stop a case from processing, and skips to the end of the switch block',
    url: _mdnJsRef + 'Statements/switch',
    url2: _mdnJsRef + 'Statements/break',
  },

  {
    // THIS IS A DUPE OF SWITCH
    tt: 'keyword',
    ts: 'case',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.case',
    syntax: `switch (expression) {
  case value1:
    // Statements executed when the result of
    // expression matches value1
    break;  // Optional - stops fall-through to next case
  case value2:
    // Statements executed when the result of
    // expression matches value2
    break;  // Optional - stops fall-through to next case
 ...
  case valueN:
    // Statements executed when the result of
    // expression matches valueN
    break;  // Optional - stops fall-through to next case
  default:  // Optional - don't have to provid default
    // Statements executed when none of the
    // values match the value of the expression
    break;  // Optional - doesn't do much for last case/default
}`,
    help:
      "The switch..case statement evaluates an expression, matching the expression's value to a case clause, and executes statements associated with the matching case",
    help2: 'If the condition is false, another statement can be executed',
    advice:
      'break statements are used to stop a case from processing, and skips to the end of the switch block',
    url: _mdnJsRef + 'Statements/switch',
    url2: _mdnJsRef + 'Statements/break',
  },

  {
    tt: 'keyword',
    ts: 'label',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.label',
    help: 'label can be used with break or continue statements.',
    help2: "This provides a control flow a bit like a 'goto' but it is not exactly the same",
    advice:
      'Avoid using labels if you can - they can lead to messy code unless you are an expert coder doing this for some very good reason',
    url: _mdnJsRef + 'Statements/label',
  },

  {
    tt: 'keyword',
    ts: 'continue',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.continue',
    help: 'Continue is a way to skip to the end of the current loop and go around again',
    help2:
      'The continue statement terminates execution of the statements in the current iteration of the current or labeled loop, and continues execution of the loop with the next iteration',
    advice: 'Continue is most commonly used in "while" and "for" loops',
    advice2:
      'There is a way to use continue with labels, but it is usually better for beginners to avoid that way of coding',
    url: _mdnJsRef + 'Statements/continue',
  },

  {
    tt: 'keyword',
    ts: 'break',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.break',
    help: 'Break is most commonly used to prematurely break out of a "switch" statement or a "for" loop',
    help2:
      'The break statement terminates the current loop, switch, or label statement and transfers program control to the statement following the terminated statement.',
    advice: 'Break is most commonly used in "switch" statements, but can be used in "while" and "for" loops',
    advice2:
      'There is a way to use "break" with labels, but it is usually better for beginners to avoid that way of coding',
    url: _mdnJsRef + 'Statements/break',
  },

  {
    tt: 'keyword',
    ts: 'while',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.while',
    syntax: `while (condition) {
  statement
}`,
    help:
      'The while statement creates a loop that executes a specified statement as long as the test condition evaluates to true',
    help2: 'The condition is evaluated BEFORE executing the statement',
    advice: '"break" and "continue" are other ways to exit loops, as is "return" (if in a function)',
    advice2: 'There is a similar form of do...while() that evaluates the condition AFTER one loop iteration',
    url: _mdnJsRef + 'Statements/while',
    url2: _mdnJsRef + 'Statements/do...while',
  },

  {
    tt: 'keyword',
    ts: 'do',
    origin: 'ecma5',
    skillNodes: _skl + 'control-flow.do-while',
    syntax: `do
   statement
while (condition);`,
    help:
      'The do...while statement creates a loop that executes a specified statement until the test condition evaluates to false',
    help2:
      'The condition is evaluated after executing the statement, resulting in the specified statement executing at least once.',
    advice: '"break" and "continue" are other ways to exit loops, as is "return" (if in a function)',
    advice2:
      'There is a similar form of while() { statements} that evaluates the condition BEFORE the statements',
    url: _mdnJsRef + 'Statements/do...while',
    url2: _mdnJsRef + 'Statements/while',
  },

  {
    tt: 'keyword',
    ts: 'for',
    origin: 'ecma5', // Note that we have covered   'in'   above since it has dual contexts
    skillNodes: _skl + 'control-flow.for',
    help: '"for" loops are a convenient way to loop through sequences and objects. There are a few forms:',
    syntax: `for (let variable in object) {...
}
...or...
for ([initialization]; [condition]; [final-expression])
   statement
`,
    advice:
      'The for () statement iterates over the enumerable properties of an object, in arbitrary order. For each distinct property, statements can be executed.',
    advice2:
      'The for (.. in ..)  statement iterates over the enumerable properties of an object, in arbitrary order. For each distinct property, statements can be executed.',
    url: _mdnJsRef + 'Statements/for',
    url2: _mdnJsRef + 'Statements/for...in',
    url3: _mdnJsRef + 'Statements/for...of',
  },

  {
    tt: 'keyword',
    ts: 'of',
    origin: 'ecma6',
    skillNodes: _skl + 'control-flow.of',
    syntax: `for (let variable of iterable) {
  statement
}`,
    help: '"for" loops are a convenient way to loop through sequences and objects. There are a few forms:',
    advice:
      'The for...of statement iterates over the enumerable properties of an object, in arbitrary order. For each distinct property, statements can be executed.',
    url: _mdnJsRef + 'Statements/for...of',
  },

  // Exception handling and debugger

  {
    tt: 'keyword',
    ts: 'debugger',
    origin: 'ecma5',
    skillNodes: _skl + 'exceptions.debugger',
    syntax: 'debugger;',
    help:
      'The "debugger" statement invokes any available debugging functionality, such as setting a breakpoint',
    advice: 'If no debugging functionality is available, this statement has no effect',
    url: _mdnJsRef + 'Statements/debugger',
  },

  {
    tt: 'keyword',
    ts: 'throw',
    origin: 'ecma5',
    skillNodes: _skl + 'exceptions.throw',
    syntax: 'throw expressionToThrow;',
    help: 'The "throw" statement throws a user-defined exception',
    help2:
      'Execution of the current function will stop (the statements after throw won\'t be executed), and control will be passed to the first "catch" block in the call stack',
    advice: 'If no "catch" block exists among caller functions, the program will terminate',
    url: _mdnJsRef + 'Statements/throw',
    url2: _mdnJsRef + 'Statements/try...catch',
    url3: _mdnJsRef + 'Global_Objects/Error',
  },

  {
    tt: 'keyword',
    ts: 'try',
    origin: 'ecma5',
    skillNodes: _skl + 'exceptions.try',
    syntax: `try {
   try_statements
}
[catch (exception_var_1 if condition_1) { // non-standard
   catch_statements_1
}]
...
[catch (exception_var_2) {
   catch_statements_2
}]
[finally {
   finally_statements
}]`,
    help:
      'The "try...catch...finally" statement marks a block of statements to try, and specifies a response, should an exception be thrown.',
    url: _mdnJsRef + 'Statements/try...catch',
    url2: _mdnJsRef + 'Statements/throw',
    url3: _mdnJsRef + 'Global_Objects/Error',
  },

  {
    // is a dupe of TRY above
    tt: 'keyword',
    ts: 'catch',
    origin: 'ecma5',
    skillNodes: _skl + 'exceptions.catch',
    syntax: `try {
   try_statements
}
[catch (exception_var_1 if condition_1) { // non-standard
   catch_statements_1
}]
...
[catch (exception_var_2) {
   catch_statements_2
}]
[finally {
   finally_statements
}]`,
    help:
      'The "try...catch...finally" statement marks a block of statements to try, and specifies a response, should an exception be thrown.',
    url: _mdnJsRef + 'Statements/try...catch',
    url2: _mdnJsRef + 'Statements/throw',
    url3: _mdnJsRef + 'Global_Objects/Error',
  },

  {
    // is a dupe of TRY and CATCH above
    tt: 'keyword',
    ts: 'finally',
    origin: 'ecma5',
    skillNodes: _skl + 'exceptions.finally',
    syntax: `try {
   try_statements
}
[catch (exception_var_1 if condition_1) { // non-standard
   catch_statements_1
}]
...
[catch (exception_var_2) {
   catch_statements_2
}]
[finally {
   finally_statements
}]`,
    help:
      'The "try...catch...finally" statement marks a block of statements to try, and specifies a response, should an exception be thrown.',
    url: _mdnJsRef + 'Statements/try...catch',
    url2: _mdnJsRef + 'Statements/throw',
    url3: _mdnJsRef + 'Global_Objects/Error',
  },

  // Import and Export

  {
    tt: 'keyword',
    ts: 'import',
    origin: 'ecma6',
    skillNodes: _skl + 'modules.import',
    help:
      'The import statement is used to import functions, objects or primitives that have been exported from an external module, another script, etc.',
    syntax: `import defaultMember from "module-name";
import * as name from "module-name";
import { member } from "module-name";
import { member as alias } from "module-name";
import { member1 , member2 } from "module-name";
import { member1 , member2 as alias2 , [...] } from "module-name";
import defaultMember, { member [ , [...] ] } from "module-name";
import defaultMember, * as name from "module-name";
import "module-name";`,
    url: _mdnJsRef + 'Statements/import',
  },

  {
    tt: 'keyword',
    ts: 'export',
    origin: 'ecma6',
    skillNodes: _skl + 'modules.export',
    help:
      'The export statement is used to export functions, objects or primitives from a given file (or module)',
    syntax: `export { name1, name2, …, nameN };
export { variable1 as name1, variable2 as name2, …, nameN };
export let name1, name2, …, nameN; // also var
export let name1 = …, name2 = …, …, nameN; // also var, const

export default expression;
export default function (…) { … } // also class, function*
export default function name1(…) { … } // also class, function*
export { name1 as default, … };

export * from …;
export { name1, name2, …, nameN } from …;
export { import1 as name1, import2 as name2, …, nameN } from …;`,
    url: _mdnJsRef + 'Statements/export',
  },

  {
    tt: 'keyword',
    ts: 'from',
    origin: 'ecma6',
    skillNodes: _skl + 'modules.import.from',
    help: (
      <span>
        You can import <strong>from</strong>:
      </span>
    ),
    advices: [
      <span key="your-assets" className="cm-s-eclipse">
        your own assets:{' '}
        <code>
          <span className="cm-keyword">import</span> <span className="cm-def">myModule</span>{' '}
          <span className="cm-keyword">from</span> <span className="cm-string">'/moduleName'</span>
        </code>
      </span>,
      <span key="other-assets" className="cm-s-eclipse">
        other user asset:{' '}
        <code>
          <span className="cm-keyword">import</span> <span className="cm-def">otherModule</span>{' '}
          <span className="cm-keyword">from</span> <span className="cm-string">'/!vault:CSSLoader'</span>
        </code>
      </span>,
      <span key="common-libraries" className="cm-s-eclipse">
        common libraries:{' '}
        <code>
          <span className="cm-keyword">import</span> <span className="cm-def">$</span>{' '}
          <span className="cm-keyword">from</span> <span className="cm-string">'jquery'</span>
        </code>
      </span>,
      <span key="external-libraries" className="cm-s-eclipse">
        external libraries:{' '}
        <code>
          <span className="cm-keyword">import</span> <span className="cm-def">three</span>{' '}
          <span className="cm-keyword">from</span>{' '}
          <span className="cm-string">'https://cdn.jsdelivr.net/threejs/0.0.0-r74/three.min.js'</span>
        </code>
      </span>,
      <span key="more-examples">
        More examples: <a href="/u/!vault/asset/ePJGm7q78tbvWB4Co">/!vault:importExamples</a>
      </span>,
    ],
  },

  // TODO: disambiguate case...default from export...default
  {
    tt: 'keyword',
    ts: 'default',
    origin: 'ecma5',
    skillNodes: _skl + 'modules.default', // and also control-flow.case-default?
    help:
      'The default keyword can be used in two situations in JavaScript: within a switch statement, or with an export statement',
    advice:
      'When used in "switch", it is executed when none of the other "case" values match the value of the expression',
    advice2: 'When used in a ES6 "export" statement, it defines default value to be exported from the module',
    url: _mdnJsRef + 'Statements/default',
    url2: _mdnJsRef + 'Statements/switch',
    url3: _mdnJsRef + 'Statements/export',
  },

  // TODO for ES6
  // get  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
  // set  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
  // extends https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends
  // static  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
  // others?
] // end helpInfo

function warnForHelp(helpItem) {
  return !(helpItem && helpItem.origin === 'ecma6') ? null : (
    <small>
      '<code>{helpItem.ts}</code>' introduced in{' '}
      <a href={xlinks.ecma6} target="_blank">
        EcmaScript 6
      </a>
    </small>
  )
  /*  <div className="ui small label" style={{color: "red"}}>
      <i className="ui circle warning icon"></i>
      <small>'<code>{helpItem.ts}</code>' is an <a href={xlinks.ecma6} target="_blank">EcmaScript 6</a> feature, but MGB only supports
        EcmaScript 5
      </small>
    </div>
  */
}

// Codemirror has a token type called string-2 which seems to almost always be a RegEx, so handle specially
function specialHandlerString2(rString) {
  let link1 = xlinks.regexper + encodeURI(rString)

  // Others?
  // //regex101.com?regex=foo&text=bar&options=baz#javascript  doesn't work well :(
  //    let link2 = "https://regex101.com?regex=" + encodeURI(rString) + "&text=TestingText&options=g/#javascript"
  // http://regexr.com/ also doesn't seem to have a good URI format to let me link to it

  return (
    <div>
      <p>
        A Regular Expression is a kind of mini-language used to define pattern-matching operations in strings.
      </p>
      <p>
        <small>
          For example <code>/ab+c/</code> will match <code>abc</code> and <code>abbc</code>
        </small>
      </p>
      <p>
        <a href={link1} target="_blank">
          Get visual explanation of {rString}
        </a>
      </p>
    </div>
  )
}

function specialHandlerCommentTitle(str, tokenDescriptionComponent) {
  const comment = tokenDescriptionComponent.props.comment
  // we need AST (tern server) to be READY for this to work.. first queries may fail to locate comment
  if (!comment) return null

  const text = comment.text.trim()
  if (text.startsWith(SpecialGlobals.editCode.mgbMentorPrefix)) return "MGB Code Mentor's comment"

  if (text.startsWith('*')) return 'JSDoc comment'

  if (comment.block) return 'Multiline comment'
  else return 'Single line comment'
}
// Explain multi-line and single-line comments.
// Explain JSDoc comments and Special MGB comments
function specialHandlerComment(tokenStr, tokenDescriptionComponent) {
  let grn = { color: 'green', fontWeight: 'bold' }
  const comment = tokenDescriptionComponent.props.comment
  // we need AST (tern server) to be READY for this to work.. first queries may fail to locate comment
  if (!comment)
    return (
      <div>
        <p>Javascript comment</p>
      </div>
    )

  const str = comment.text.trim()
  if (str.startsWith(SpecialGlobals.editCode.mgbMentorPrefix))
    return (
      <div>
        <p>{str.substring(SpecialGlobals.editCode.mgbMentorPrefix.length).trim()}</p>
      </div>
    )

  // explain single line
  if (comment.block === false)
    return (
      <div>
        <p>
          Javascript <em>single line comments</em> start with <code style={grn}>//</code> and continue until
          the end of the current line
        </p>
      </div>
    )

  if (comment.block && str.startsWith('*'))
    return (
      <div>
        <p>
          Comments starting with <code style={grn}>/**</code> and ending with <code style={grn}>*/</code> are
          special JavaScript comments - called JSDoc.
          <br />
          JSDoc is a markup language used to annotate JavaScript source code files. Using comments containing
          JSDoc, programmers can add documentation describing the application programming interface of the
          code they're creating.
        </p>

        <p>
          There may be line breaks and any other characters between the <code style={grn}>/**</code> and{' '}
          <code style={grn}>*/</code>. This is example of JSDoc comment:
        </p>
        <pre style={grn}>{`/**
 * Create a point.
 * @param {number} x - The x value
 * @param {number} y - The y value
 * */
        `}</pre>
        <p>
          See{' '}
          <a href={xlinks.jsDoc} target="_blank">
            jsdoc.org
          </a>{' '}
          for more details
        </p>
      </div>
    )

  return (
    <div>
      <p>
        Javascript <em>multi line comments</em> start with <code style={grn}>/*</code> and end with{' '}
        <code style={grn}>*/</code>
      </p>
      <small>
        <p>
          There may be line breaks and any other characters between the <code style={grn}>/*</code> and{' '}
          <code style={grn}>*/</code>
        </p>
        <pre style={grn}>
          /* This is an<br /> example multiline comment */
        </pre>
        <p>
          You may also see/use a special variant of multiline javascript comments with{' '}
          <code style={grn}>@something</code> strings like <code style={grn}>@param</code>. Developers use
          these to document their code so that automatic help text and api documentation can be extracted from
          the source code. See{' '}
          <a href={xlinks.jsDoc} target="_blank">
            jsdoc.org
          </a>{' '}
          for details
        </p>
      </small>
    </div>
  )
}

// This is a definition. Maybe we can do more with this
function specialHandlerDef(str) {
  // TODO - constructor() https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
  return <p>This is where a variable, function, or property is defined</p>
}

// This is a GLOBAL variable.  TokenType='variable'.  See https://github.com/codemirror/CodeMirror/issues/4284
// Maybe we can do more with this in future?
function specialHandlerGlobalVariable(str) {
  return (
    <div>
      <p>
        This is a use of the variable{' '}
        <strong>
          <code>{str}</code>
        </strong>{' '}
        which appears to be a <strong>GLOBAL</strong> variable
      </p>
      <p>
        <small>
          ...(or maybe the developer may intend for it to be LOCAL, but may not yet have defined/declared it
          in a LOCAL scope for this usage)
        </small>
      </p>
    </div>
  )
}

// This is a LOCAL variable.. TokenType='variable-2'. See https://github.com/codemirror/CodeMirror/issues/4284
// Maybe we can do more with this in future?
function specialHandlerLocalVariable(str) {
  const statementSty = { color: '#7F0055', fontWeight: 'bold' }

  // TODO - constructor() https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor
  return (
    <div>
      <p>
        This is a use of the variable{' '}
        <strong>
          <code>{str}</code>
        </strong>{' '}
        which appears to be a <strong>LOCAL</strong> variable
      </p>
      <small>
        <p>
          The original version of Javascript before{' '}
          <a href={xlinks.ecma6} target="_blank">
            EcmaScript 6
          </a>{' '}
          only had a single kind of <strong>local</strong> variable scope system. This is known as{' '}
          <strong>Execution Scope</strong> and is the scope used for variables defined using the{' '}
          <code style={statementSty}>var</code> keyword.
        </p>
        <p>
          As of 2015, the{' '}
          <a href={xlinks.ecma6} target="_blank">
            EcmaScript 6
          </a>{' '}
          version of JavaScript added an <strong>additional local</strong> variable scope system. This new
          local scope system is known as <strong>Block Scope</strong> and is the scope used for variables
          defined using the <code style={statementSty}>let</code> and <code style={statementSty}>const</code>{' '}
          keywords.
        </p>
        <p>
          See{' '}
          <a href={xlinks.mdnLet} target="_blank">
            let
          </a>{' '}
          for details on <strong>Block Scope</strong>.<br />
          See{' '}
          <a href={xlinks.mdnVar} target="_blank">
            var
          </a>{' '}
          for details on <strong>Execution Scope</strong>.
        </p>
      </small>
    </div>
  )
}

// helper function - generates a <a> link using the fragment after the last /
function urlLink(urlString) {
  if (urlString === undefined || urlString === null || urlString.length === 0) return null

  // TODO remove stuff after ?
  return (
    <a href={urlString} target="_blank">
      <small>{_.last(urlString.split('/'))}</small>
    </a>
  )
}

const TokenDescription = React.createClass({
  propTypes: {
    currentToken: PropTypes.object,
    comment: PropTypes.object, // info about comment - if any
    //getPrevToken: PropTypes.func.isRequired,
    //getNextToken: PropTypes.func.isRequired
  },

  contextTypes: {
    skills: PropTypes.object,
  },

  handleHideShowClick(skillNodeKey) {
    if (!skillNodeKey) return

    if (hasSkill(this.context.skills, skillNodeKey)) Meteor.call('Skill.forget', skillNodeKey)
    else Meteor.call('Skill.learn', skillNodeKey)
  },

  render() {
    let token = this.props.currentToken
    // search for the next token - just in case..
    /*
    TODO: @stauzs fix this and uncomment - this is pretty slow atm
    we need to check next token ONLY when char === 0
    so we can show correct info if cursor is before keyword

    if (!token || !token.type){
      this.props.getNextToken((tok) => {
        if(tok && tok.type){
          token = tok
        }
      })
      if(!token || !token.type){
        return null
      }
    }*/

    // we have slightly smarter comment handling - even if CM cannot figure out that token has comment type
    let type = this.props.comment ? 'comment' : token ? token.type : null

    if (_.includes(noHelpTypes, type)) return null

    let ts = token.string.trim()
    let specialHandler = specialHelpTypes[type]

    const maxTokenLenToShow = 20
    let tsTrunc = ts.length > maxTokenLenToShow ? ts.substr(0, maxTokenLenToShow) + '...' : ts

    let help = _.find(helpInfo, h => h.tt === type && (h.ts === null || h.ts === ts))
    let tokenTypeToDisplay = specialHandler
      ? typeof specialHandler.betterTypeName == 'function'
        ? specialHandler.betterTypeName(ts, this) || type
        : specialHandler.betterTypeName
      : type

    const skillNodeKey = specialHandler ? specialHandler.skillNodes : help ? help.skillNodes || null : null
    let showExpanded =
      !skillNodeKey || (isSkillKeyValid(skillNodeKey) && !hasSkill(this.context.skills, skillNodeKey))

    let showStringInTitle = !specialHandler || specialHandler.showTokenStringInTitle
    // Special cases that won't involve a skillNode lookup
    if (
      type != 'variable' &&
      type != 'variable-2' &&
      type != 'def' &&
      (!skillNodeKey || !isSkillKeyValid(skillNodeKey))
    ) {
      console.log(`TokenDescription database has no SkillNode for TT:'${type}' TS:'${tsTrunc}'`)
      showExpanded = true
    }

    const advices = []
    if (help && help.advices) {
      for (let i = 0; i < help.advices.length; i++) {
        advices.push(
          <p key={advices.length} style={{ margin: 0 }}>
            <i className="ui info circle icon" />
            <small style={{ fontSize: '85%' }}>{help.advices[i]}</small>
          </p>,
        )
      }
    }

    return (
      <div className="ui purple segment" style={{ backgroundColor: 'rgba(160,32,240,0.03)' }}>
        <a className="ui purple left ribbon label">
          <small>{tokenTypeToDisplay}</small>
          {showStringInTitle && (
            <code>
              <b>&nbsp;&nbsp;{tsTrunc}</b>
            </code>
          )}
        </a>
        <a
          className="ui purple right corner label"
          title={`Click to ${showExpanded
            ? 'hide'
            : 'show'} the explanation of this javascript language feature`}
          onClick={() => this.handleHideShowClick(skillNodeKey)}
        >
          <i className={(!showExpanded ? 'add circle ' : 'minus circle ') + ' icon'} />
        </a>
        <p />

        {showExpanded &&
          (specialHandler ? (
            specialHandler.renderFn(ts, this)
          ) : (
            <div>
              {help && warnForHelp(help)}
              {help && help.help && <p>{help.help}</p>}
              {help &&
              help.syntax && (
                <pre>
                  <small>{help.syntax}</small>
                </pre>
              )}

              {help &&
              help.advice && (
                <p>
                  <i className="ui info circle icon" />
                  <small>{help.advice}</small>
                </p>
              )}
              {help &&
              help.advice2 && (
                <p>
                  <i className="ui info circle icon" />
                  <small>{help.advice2}</small>
                </p>
              )}
              {advices.length > 0 && advices}
              {help &&
              help.url && (
                <p>
                  {urlLink(help.url)}
                  {help.url2 && <span>, {urlLink(help.url2)}</span>}
                  {help.url3 && <span>, {urlLink(help.url3)}</span>}
                </p>
              )}
            </div>
          ))}
      </div>
    )
  },
})

export default TokenDescription
