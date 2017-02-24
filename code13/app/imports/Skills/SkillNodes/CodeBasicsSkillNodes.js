import C from './CommonSkillNodes'


export default {
  $meta: {
    name:           'JavaScript Basics',
    description:    '10 hours of content'
  },

  'comments' : {
    $meta: {
      name: 'Comment your JavaScript Code',
      icon: 'code',
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
    comments: C.En(0)
  },

  'variables' : {
    $meta: {
      name: 'Declare JavaScript Variables',
      icon: 'code',
      description: [
      "In computer science, <dfn>data</dfn> is anything that is meaningful to the computer. JavaScript provides seven different <dfn>data types</dfn> which are <code>undefined</code>, <code>null</code>, <code>boolean</code>, <code>string</code>, <code>symbol</code>, <code>number</code>, and <code>object</code>.",
      "For example, computers distinguish between numbers, such as the number <code>12</code>, and <code>strings</code>, such as <code>\"12\"</code>, <code>\"dog\"</code>, or <code>\"123 cats\"</code>, which are collections of characters. Computers can perform mathematical operations on a number, but not on a string.",
      "<dfn>Variables</dfn> allow computers to store and manipulate data in a dynamic fashion. They do this by using a \"label\" to point to the data rather than using the data itself. Any of the seven data types may be stored in a variable.",
      "<code>Variables</code> are similar to the x and y variables you use in mathematics, which means they're a simple name to represent the data we want to refer to. Computer <code>variables</code> differ from mathematical variables in that they can store different values at different times.",
      "We tell JavaScript to create or <dfn>declare</dfn> a variable by putting the keyword <code>var</code> in front of it, like so:",
      "<blockquote>var ourName;</blockquote>",
      "creates a <code>variable</code> called <code>ourName</code>. In JavaScript we end statements with semicolons.",
      "<code>Variable</code> names can be made up of numbers, letters, and <code>$</code> or <code>_</code>, but may not contain spaces or start with a number.",
      "<hr>",
      "Use the <code>var</code> keyword to create a variable called <code>myName</code>.",
      "<strong>Hint</strong><br>Look at the <code>ourName</code> example if you get stuck."
      ],
      "code": [
      "// Example",
      "var ourName;",
      "",
      "// Define myName below this line",
      ""
      ],
      "solutions": [
      "var myName;"
      ],
      "tests": [
      "assert(/var\\s+myName\\s*;/.test(code), 'message: You should declare <code>myName</code> with the <code>var</code> keyword, ending with a semicolon');"
      ],
    },
    variables: C.En(0)
  },

  'assignmentOperator' : {
    $meta: {
      name: 'Storing Values with the Assignment Operator',
      icon: 'code',
      description: [
        "In JavaScript, you can store a value in a variable with the <dfn>assignment</dfn> operator.",
        "<code>myVariable = 5;</code>",
        "Assigns the <code>Number</code> value <code>5</code> to <code>myVariable</code>.",
        "Assignment always goes from right to left. Everything to the right of the <code>=</code> operator is resolved before the value is assigned to the variable to the left of the operator.",
        "<blockquote>myVar = 5;<br>myNum = myVar;</blockquote>",
        "Assigns <code>5</code> to <code>myVar</code> and then resolves <code>myVar</code> to <code>5</code>  again and assigns it to <code>myNum</code>.",
        "<hr>",
        "Assign the value <code>7</code> to variable <code>a</code>.",
        "Assign the contents of <code>a</code> to variable <code>b</code>."
      ],
      "code": [
        "// Setup",
        "var a;",
        "var b = 2;",
        "",
        "// Only change code below this line",
        ""
      ],
      "solutions": [
        "var a;\nvar b = 2;\na = 7;\nb = a;"
      ],
      "tests": [
        "assert(/var a;/.test(code) && /var b = 2;/.test(code), 'message: Do not change code above the line');",
        "assert(typeof a === 'number' && a === 7, 'message: <code>a</code> should have a value of 7');",
        "assert(typeof b === 'number' && b === 7, 'message: <code>b</code> should have a value of 7');",
        "assert(/b\\s*=\\s*a\\s*;/g.test(code), 'message: <code>a</code> should be assigned to <code>b</code> with <code>=</code>');"      ],
    },
    assignmentOperator: C.En(0)
  },

  
}