import C from './CommonSkillNodes'

export default {
	"$meta": {
		"name": "JavaScript Basics",
		"description": "10 hours of content"
	},
	"comments": {
		"$meta": {
			"name": "Comment your JavaScript Code",
			"icon": "code",
			"description": [
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
				"// comment"
			],
			"solutions": [
				"// Fake Comment\n/* Another Comment */"
			],
			"tests": [
				"assert(code.match(/(\\/\\/)...../g), 'message: Create a <code>//</code> style comment that contains at least five letters.');",
				"assert(code.match(/(\\/\\*)([^\\*\\/]{5,})(?=\\*\\/)/gm), 'message: Create a <code>/* */</code> style comment that contains at least five letters.');"
			]
		},
		"comments": C.En(0)
	},
	"variables": {
		"$meta": {
			"name": "Declare JavaScript Variables",
			"icon": "code",
			"description": [
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
			]
		},
		"variables": C.En(0)
	},
	"assignmentOperator": {
		"$meta": {
			"name": "Storing Values with the Assignment Operator",
			"icon": "code",
			"description": [
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
				"assert(/b\\s*=\\s*a\\s*;/g.test(code), 'message: <code>a</code> should be assigned to <code>b</code> with <code>=</code>');"
			]
		},
		"assignmentOperator": C.En(0)
	},
	"initVariables": {
		"$meta": {
			"name": "Initializing Variables with the Assignment Operator",
			"icon": "code",
			"description": [
				"It is common to <dfn>initialize</dfn> a variable to an initial value in the same line as it is declared.",
				"<code>var myVar = 0;</code>",
				"Creates a new variable called <code>myVar</code> and assigns it an initial value of <code>0</code>.",
				"<hr>",
				"Define a variable <code>a</code> with <code>var</code> and initialize it to a value of <code>9</code>."
			],
			"code": [
				"// Example",
				"var ourVar = 19;",
				"",
				"// Only change code below this line",
				""
			],
			"solutions": [
				"var a = 9;"
			],
			"tests": [
				"assert(/var\\s+a\\s*=\\s*9\\s*/.test(code), 'message: Initialize <code>a</code> to a value of <code>9</code>');"
			]
		},
		"initVariables": C.En(0)
	},
	"unitializedVariables": {
		"$meta": {
			"name": "Understanding Uninitialized Variables",
			"icon": "code",
			"description": [
				"When JavaScript variables are declared, they have an initial value of <code>undefined</code>. If you do a mathematical operation on an <code>undefined</code> variable your result will be <code>NaN</code> which means <dfn>\"Not a Number\"</dfn>. If you concatenate a string with an <code>undefined</code> variable, you will get a literal <dfn>string</dfn> of <code>\"undefined\"</code>.",
				"<hr>",
				"Initialize the three variables <code>a</code>, <code>b</code>, and <code>c</code> with <code>5</code>, <code>10</code>, and <code>\"I am a\"</code> respectively so that they will not be <code>undefined</code>."
			],
			"code": [
				"// Initialize these three variables",
				"var a;",
				"var b;",
				"var c;",
				"",
				"// Do not change code below this line",
				"",
				"a = a + 1;",
				"b = b + 5;",
				"c = c + \" String!\";",
				""
			],
			"solutions": [
				"var a = 5;\nvar b = 10;\nvar c = \"I am a\";\na = a + 1;\nb = b + 5;\nc = c + \" String!\";"
			],
			"tests": [
				"assert(typeof a === 'number' && a === 6, 'message: <code>a</code> should be defined and have a value of <code>6</code>');",
				"assert(typeof b === 'number' && b === 15, 'message: <code>b</code> should be defined and have a value of <code>15</code>');",
				"assert(!/undefined/.test(c) && c === \"I am a String!\", 'message: <code>c</code> should not contain <code>undefined</code> and should have a value of \"I am a String!\"');",
				"assert(/a = a \\+ 1;/.test(code) && /b = b \\+ 5;/.test(code) && /c = c \\+ \" String!\";/.test(code), 'message: Do not change code below the line');"
			]
		},
		"unitializedVariables": C.En(0)
	},
	"caseSensitiveVariables": {
		"$meta": {
			"name": "Understanding Case Sensitivity in Variables",
			"icon": "code",
			"description": [
				"In JavaScript all variables and function names are case sensitive. This means that capitalization matters.",
				"<code>MYVAR</code> is not the same as <code>MyVar</code> nor <code>myvar</code>. It is possible to have multiple distinct variables with the same name but different casing. It is strongly recommended that for the sake of clarity, you <em>do not</em> use this language feature.",
				"<h4>Best Practice</h4>",
				"Write variable names in Javascript in <dfn>camelCase</dfn>. In <dfn>camelCase</dfn>, multi-word variable names have the first word in lowercase and the first letter of each subsequent word is capitalized.",
				"<strong>Examples:</strong>",
				"<blockquote>var someVariable;<br>var anotherVariableName;<br>var thisVariableNameIsTooLong;</blockquote>",
				"<hr>",
				"Modify the existing declarations and assignments so their names use <dfn>camelCase</dfn>.<br>Do not create any new variables."
			],
			"code": [
				"// Declarations",
				"var StUdLyCapVaR;",
				"var properCamelCase;",
				"var TitleCaseOver;",
				"",
				"// Assignments",
				"STUDLYCAPVAR = 10;",
				"PRoperCAmelCAse = \"A String\";",
				"tITLEcASEoVER = 9000;"
			],
			"solutions": [
				"var studlyCapVar;\nvar properCamelCase;\nvar titleCaseOver;\n\nstudlyCapVar = 10;\nproperCamelCase = \"A String\";\ntitleCaseOver = 9000;"
			],
			"tests": [
				"assert(typeof studlyCapVar !== 'undefined' && studlyCapVar === 10, 'message: <code>studlyCapVar</code> is defined and has a value of <code>10</code>');",
				"assert(typeof properCamelCase !== 'undefined' && properCamelCase === \"A String\", 'message: <code>properCamelCase</code> is defined and has a value of <code>\"A String\"</code>');",
				"assert(typeof titleCaseOver !== 'undefined' && titleCaseOver === 9000, 'message: <code>titleCaseOver</code> is defined and has a value of <code>9000</code>');",
				"assert(code.match(/studlyCapVar/g).length === 2, 'message: <code>studlyCapVar</code> should use camelCase in both declaration and assignment sections.');",
				"assert(code.match(/properCamelCase/g).length === 2, 'message: <code>properCamelCase</code> should use camelCase in both declaration and assignment sections.');",
				"assert(code.match(/titleCaseOver/g).length === 2, 'message: <code>titleCaseOver</code> should use camelCase in both declaration and assignment sections.');"
			]
		},
		"caseSensitiveVariables": C.En(0)
	},
	"sumNumbers": {
		"$meta": {
			"name": "Add Two Numbers with JavaScript",
			"icon": "code",
			"description": [
				"<code>Number</code> is a data type in JavaScript which represents numeric data.",
				"Now let's try to add two numbers using JavaScript.",
				"JavaScript uses the <code>+</code> symbol as addition operation when placed between two numbers.",
				"<strong>Example</strong>",
				"<blockquote>myVar = 5 + 10; // assigned 15</blockquote>",
				"<hr>",
				"Change the <code>0</code> so that sum will equal <code>20</code>."
			],
			"code": [
				"var sum = 10 + 0;",
				""
			],
			"solutions": [
				"var sum = 10 + 10;"
			],
			"tests": [
				"assert(sum === 20, 'message: <code>sum</code> should equal <code>20</code>');",
				"assert(/\\+/.test(code), 'message: Use the <code>+</code> operator');"
			]
		},
		"sumNumbers": C.En(0)
	},
	"subtractNumbers": {
		"$meta": {
			"name": "Subtract One Number from Another with JavaScript",
			"icon": "code",
			"description": [
				"We can also subtract one number from another.",
				"JavaScript uses the <code>-</code> symbol for subtraction.",
				"",
				"<strong>Example</strong>",
				"<blockquote>myVar = 12 - 6; // assigned 6</blockquote>",
				"",
				"<hr>",
				"Change the <code>0</code> so the difference is <code>12</code>."
			],
			"code": [
				"var difference = 45 - 0;",
				"",
				""
			],
			"solutions": [
				"var difference = 45 - 33;"
			],
			"tests": [
				"assert(difference === 12, 'message: Make the variable <code>difference</code> equal 12.');",
				"assert((code).match(/difference/g).length === 1,'message: Only change the first line');",
				"assert(/\\d+\\s*-\\s*\\d+/.test(code),'message: Use the <code>-</code> operator');"
			]
		},
		"subtractNumbers": C.En(0)
	},
	"multiplyNumbers": {
		"$meta": {
			"name": "Multiply Two Numbers with JavaScript",
			"icon": "code",
			"description": [
				"We can also multiply one number by another.",
				"JavaScript uses the <code>*</code> symbol for multiplication of two numbers.",
				"",
				"<strong>Example</strong>",
				"<blockquote>myVar = 13 * 13; // assigned 169</blockquote>",
				"",
				"<hr>",
				"Change the <code>0</code> so that product will equal <code>80</code>."
			],
			"code": [
				"var product = 8 * 0;",
				"",
				""
			],
			"solutions": [
				"var product = 8 * 10;"
			],
			"tests": [
				"assert(product === 80,'message: Make the variable <code>product</code> equal 80');",
				"assert(/\\*/.test(code), 'message: Use the <code>*</code> operator');"
			]
		},
		"multiplyNumbers": C.En(0)
	},
	"divideNumbers": {
		"$meta": {
			"name": "Divide One Number by Another with JavaScript",
			"icon": "code",
			"description": [
				"We can also divide one number by another.",
				"JavaScript uses the <code>/</code> symbol for division.",
				"",
				"<strong>Example</strong>",
				"<blockquote>myVar = 16 / 2; // assigned 8</blockquote>",
				"",
				"<hr>",
				"Change the <code>0</code> so that the <code>quotient</code> is equal to <code>2</code>."
			],
			"code": [
				"var quotient = 66 / 0;",
				"",
				""
			],
			"solutions": [
				"var quotient = 66 / 33;"
			],
			"tests": [
				"assert(quotient === 2, 'message: Make the variable <code>quotient</code> equal to 2.');",
				"assert(/\\d+\\s*\\/\\s*\\d+/.test(code), 'message: Use the <code>/</code> operator');"
			]
		},
		"divideNumbers": C.En(0)
	},
	"incrementNumbers": {
		"$meta": {
			"name": "Increment a Number with JavaScript",
			"icon": "code",
			"description": [
				"You can easily <dfn>increment</dfn> or add one to a variable with the <code>++</code> operator.",
				"<code>i++;</code>",
				"is the equivalent of",
				"<code>i = i + 1;</code>",
				"<strong>Note</strong><br>The entire line becomes <code>i++;</code>, eliminating the need for the equal sign.",
				"<hr>",
				"Change the code to use the <code>++</code> operator on <code>myVar</code>.",
				"<strong>Hint</strong><br>Learn more about <a href=\"https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Increment_()\" target=\"_blank\">Arithmetic operators - Increment (++)</a>."
			],
			"code": [
				"var myVar = 87;",
				"",
				"// Only change code below this line",
				"myVar = myVar + 1;",
				""
			],
			"solutions": [
				"var myVar = 87;\nmyVar++;"
			],
			"tests": [
				"assert(myVar === 88, 'message: <code>myVar</code> should equal <code>88</code>');",
				"assert(/myVar\\s*\\=.*myVar/.test(code) === false, 'message: <code>myVar = myVar + 1;</code> should be changed');",
				"assert(/[+]{2}\\s*myVar|myVar\\s*[+]{2}/.test(code), 'message: Use the <code>++</code> operator');",
				"assert(/var myVar = 87;/.test(code), 'message: Do not change code above the line');"
			]
		},
		"incrementNumbers": C.En(0)
	},
	"decrementNumbers": {
		"$meta": {
			"name": "Decrement a Number with JavaScript",
			"icon": "code",
			"description": [
				"You can easily <dfn>decrement</dfn> or decrease a variable by one with the <code>--</code> operator.",
				"<code>i--;</code>",
				"is the equivalent of",
				"<code>i = i - 1;</code>",
				"<strong>Note</strong><br>The entire line becomes <code>i--;</code>, eliminating the need for the equal sign.",
				"<hr>",
				"Change the code to use the <code>--</code> operator on <code>myVar</code>."
			],
			"code": [
				"var myVar = 11;",
				"",
				"// Only change code below this line",
				"myVar = myVar - 1;",
				""
			],
			"solutions": [
				"var myVar = 11;\nmyVar--;"
			],
			"tests": [
				"assert(myVar === 10, 'message: <code>myVar</code> should equal <code>10</code>');",
				"assert(/[-]{2}\\s*myVar|myVar\\s*[-]{2}/.test(code), 'message: Use the <code>--</code> operator on <code>myVar</code>');",
				"assert(/var myVar = 11;/.test(code), 'message: Do not change code above the line');"
			]
		},
		"decrementNumbers": C.En(0)
	},
	"createDecimal": {
		"$meta": {
			"name": "Create Decimal Numbers with JavaScript",
			"icon": "code",
			"description": [
				"We can store decimal numbers in variables too. Decimal numbers are sometimes referred to as <dfn>floating point</dfn> numbers or <dfn>floats</dfn>.",
				"<strong>Note</strong><br>Not all real numbers can accurately be represented in <dfn>floating point</dfn>. This can lead to rounding errors. <a href=\"https://en.wikipedia.org/wiki/Floating_point#Accuracy_problems\" target=\"_blank\">Details Here</a>.",
				"<hr>",
				"Create a variable <code>myDecimal</code> and give it a decimal value with a fractional part (e.g. <code>5.7</code>)."
			],
			"code": [
				"var ourDecimal = 5.7;",
				"",
				"// Only change code below this line",
				"",
				""
			],
			"solutions": [
				"var myDecimal = 9.9;"
			],
			"tests": [
				"assert(typeof myDecimal === \"number\", 'message: <code>myDecimal</code> should be a number.');",
				"assert(myDecimal % 1 != 0, 'message: <code>myDecimal</code> should have a decimal point'); "
			]
		},
		"createDecimal": C.En(0)
	},
	"multiplyDecimal": {
		"$meta": {
			"name": "Multiply Two Decimals with JavaScript",
			"icon": "code",
			"description": [
				"In JavaScript, you can also perform calculations with decimal numbers, just like whole numbers.",
				"Let's multiply two decimals together to get their product.",
				"<hr>",
				"Change the <code>0.0</code> so that product will equal <code>5.0</code>."
			],
			"code": [
				"var product = 2.0 * 0.0;",
				"",
				""
			],
			"solutions": [
				"var product = 2.0 * 2.5;"
			],
			"tests": [
				"assert(product === 5.0, 'message: The variable <code>product</code> should equal <code>5.0</code>.');",
				"assert(/\\*/.test(code), 'message: You should use the <code>*</code> operator');"
			]
		},
		"multiplyDecimal": C.En(0)
	},
	"divideDecimal": {
		"$meta": {
			"name": "Divide one Decimal by Another with JavaScript",
			"icon": "code",
			"description": [
				"Now let's divide one decimal by another.",
				"<hr>",
				"Change the <code>0.0</code> so that <code>quotient</code> will equal to <code>2.2</code>."
			],
			"code": [
				"var quotient = 0.0 / 2.0; // Fix this line",
				"",
				""
			],
			"solutions": [],
			"tests": [
				"assert(quotient === 2.2, 'message: The variable <code>quotient</code> should equal <code>2.2</code>');",
				"assert(/4\\.40*\\s*\\/\\s*2\\.*0*/.test(code), 'message: You should use the <code>/</code> operator to divide 4.4 by 2');",
				"assert(code.match(/quotient/g).length === 3, 'message: The quotient variable should only be assigned once');"
			]
		},
		"divideDecimal": C.En(0)
	},
	"findingRemainder": {
		"$meta": {
			"name": "Finding a Remainder in JavaScript",
			"icon": "code",
			"description": [
				"The <dfn>remainder</dfn> operator <code>%</code> gives the remainder of the division of two numbers.",
				"<strong>Example</strong>",
				"<blockquote>5 % 2 = 1 because<br>Math.floor(5 / 2) = 2 (Quotient)<br>2 * 2 = 4<br>5 - 4 = 1 (Remainder)</blockquote>",
				"<strong>Usage</strong><br>In mathematics, a number can be checked to be even or odd by checking the remainder of the division of the number by <code>2</code>.",
				"<blockquote>17 % 2 = 1 (17 is Odd)<br>48 % 2 = 0 (48 is Even)</blockquote>",
				"<strong>Note</strong><br>The <dfn>remainder</dfn> operator is sometimes incorrectly referred to as  the \"modulus\" operator. It is very similar to modulus, but does not work properly with negative numbers.",
				"<hr>",
				"Set <code>remainder</code> equal to the remainder of <code>11</code> divided by <code>3</code> using the <dfn>remainder</dfn> (<code>%</code>) operator."
			],
			"code": [
				"// Only change code below this line",
				"",
				"var remainder;",
				""
			],
			"solutions": [
				"var remainder =  11 % 3;"
			],
			"tests": [
				"assert(/var\\s+?remainder/.test(code), 'message: The variable <code>remainder</code> should be initialized');",
				"assert(remainder === 2, 'message: The value of <code>remainder</code> should be <code>2</code>');",
				"assert(/\\s+?remainder\\s*?=\\s*?.*%.*;/.test(code), 'message: You should use the <code>%</code> operator');"
			]
		},
		"findingRemainder": C.En(0)
	},
	"assignmentWithAddition": {
		"$meta": {
			"name": "Compound Assignment With Augmented Addition",
			"icon": "code",
			"description": [
				"In programming, it is common to use assignments to modify the contents of a variable. Remember that everything to the right of the equals sign is evaluated first, so we can say:",
				"<code>myVar = myVar + 5;</code>",
				"to add <code>5</code> to <code>myVar</code>. Since this is such a common pattern, there are operators which do both a mathematical operation and assignment in one step.",
				"One such operator is the <code>+=</code> operator.",
				"<blockquote>var myVar = 1;<br>myVar += 5;<br>console.log(myVar); // Returns 6</blockquote>",
				"<hr>",
				"Convert the assignments for <code>a</code>, <code>b</code>, and <code>c</code> to use the <code>+=</code> operator."
			],
			"code": [
				"var a = 3;",
				"var b = 17;",
				"var c = 12;",
				"",
				"// Only modify code below this line",
				"",
				"a = a + 12;",
				"b = 9 + b;",
				"c = c + 7;",
				""
			],
			"solutions": [
				"var a = 3;\nvar b = 17;\nvar c = 12;\n\na += 12;\nb += 9;\nc += 7;"
			],
			"tests": [
				"assert(a === 15, 'message: <code>a</code> should equal <code>15</code>');",
				"assert(b === 26, 'message: <code>b</code> should equal <code>26</code>');",
				"assert(c === 19, 'message: <code>c</code> should equal <code>19</code>');",
				"assert(code.match(/\\+=/g).length === 3, 'message: You should use the <code>+=</code> operator for each variable');",
				"assert(/var a = 3;/.test(code) && /var b = 17;/.test(code) && /var c = 12;/.test(code), 'message: Do not modify the code above the line');"
			]
		},
		"assignmentWithAddition": C.En(0)
	},
	"assignmentWithSubtraction": {
		"$meta": {
			"name": "Compound Assignment With Augmented Subtraction",
			"icon": "code",
			"description": [
				"Like the <code>+=</code> operator, <code>-=</code> subtracts a number from a variable.",
				"<code>myVar = myVar - 5;</code>",
				"will subtract <code>5</code> from <code>myVar</code>. This can be rewritten as: ",
				"<code>myVar -= 5;</code>",
				"<hr>",
				"Convert the assignments for <code>a</code>, <code>b</code>, and <code>c</code> to use the <code>-=</code> operator."
			],
			"code": [
				"var a = 11;",
				"var b = 9;",
				"var c = 3;",
				"",
				"// Only modify code below this line",
				"",
				"a = a - 6;",
				"b = b - 15;",
				"c = c - 1;",
				"",
				""
			],
			"solutions": [
				"var a = 11;\nvar b = 9;\nvar c = 3;\n\na -= 6;\nb -= 15;\nc -= 1;\n\n"
			],
			"tests": [
				"assert(a === 5, 'message: <code>a</code> should equal <code>5</code>');",
				"assert(b === -6, 'message: <code>b</code> should equal <code>-6</code>');",
				"assert(c === 2, 'message: <code>c</code> should equal <code>2</code>');",
				"assert(code.match(/-=/g).length === 3, 'message: You should use the <code>-=</code> operator for each variable');",
				"assert(/var a = 11;/.test(code) && /var b = 9;/.test(code) && /var c = 3;/.test(code), 'message: Do not modify the code above the line');"
			]
		},
		"assignmentWithSubtraction": C.En(0)
	},
	"assignmentWithMultiplication": {
		"$meta": {
			"name": "Compound Assignment With Augmented Multiplication",
			"icon": "code",
			"description": [
				"The <code>*=</code> operator multiplies a variable by a number.",
				"<code>myVar = myVar * 5;</code>",
				"will multiply <code>myVar</code> by <code>5</code>. This can be rewritten as: ",
				"<code>myVar *= 5;</code>",
				"<hr>",
				"Convert the assignments for <code>a</code>, <code>b</code>, and <code>c</code> to use the <code>*=</code> operator."
			],
			"code": [
				"var a = 5;",
				"var b = 12;",
				"var c = 4.6;",
				"",
				"// Only modify code below this line",
				"",
				"a = a * 5;",
				"b = 3 * b;",
				"c = c * 10;",
				"",
				""
			],
			"solutions": [
				"var a = 5;\nvar b = 12;\nvar c = 4.6;\n\na *= 5;\nb *= 3;\nc *= 10;"
			],
			"tests": [
				"assert(a === 25, 'message: <code>a</code> should equal <code>25</code>');",
				"assert(b === 36, 'message: <code>b</code> should equal <code>36</code>');",
				"assert(c === 46, 'message: <code>c</code> should equal <code>46</code>');",
				"assert(code.match(/\\*=/g).length === 3, 'message: You should use the <code>*=</code> operator for each variable');",
				"assert(/var a = 5;/.test(code) && /var b = 12;/.test(code) && /var c = 4\\.6;/.test(code), 'message: Do not modify the code above the line');"
			]
		},
		"assignmentWithMultiplication": C.En(0)
	},
	"assignmentWithDivision": {
		"$meta": {
			"name": "Compound Assignment With Augmented Division",
			"icon": "code",
			"description": [
				"The <code>/=</code> operator divides a variable by another number.",
				"<code>myVar = myVar / 5;</code>",
				"Will divide <code>myVar</code> by <code>5</code>. This can be rewritten as: ",
				"<code>myVar /= 5;</code>",
				"<hr>",
				"Convert the assignments for <code>a</code>, <code>b</code>, and <code>c</code> to use the <code>/=</code> operator."
			],
			"code": [
				"var a = 48;",
				"var b = 108;",
				"var c = 33;",
				"",
				"// Only modify code below this line",
				"",
				"a = a / 12;",
				"b = b / 4;",
				"c = c / 11;",
				""
			],
			"solutions": [
				"var a = 48;\nvar b = 108;\nvar c = 33;\n\na /= 12;\nb /= 4;\nc /= 11;"
			],
			"tests": [
				"assert(a === 4, 'message: <code>a</code> should equal <code>4</code>');",
				"assert(b === 27, 'message: <code>b</code> should equal <code>27</code>');",
				"assert(c === 3, 'message: <code>c</code> should equal <code>3</code>');",
				"assert(code.match(/\\/=/g).length === 3, 'message: You should use the <code>/=</code> operator for each variable');",
				"assert(/var a = 48;/.test(code) && /var b = 108;/.test(code) && /var c = 33;/.test(code), 'message: Do not modify the code above the line');"
			]
		},
		"assignmentWithDivision": C.En(0)
	},
	"declareString": {
		"$meta": {
			"name": "Declare String Variables",
			"icon": "code",
			"description": [
				"Previously we have used the code",
				"<code>var myName = \"your name\";</code>",
				"<code>\"your name\"</code> is called a <dfn>string</dfn> <dfn>literal</dfn>. It is a string because it is a series of zero or more characters enclosed in single or double quotes.",
				"<hr>",
				"Create two new <code>string</code> variables: <code>myFirstName</code> and <code>myLastName</code> and assign them the values of your first and last name, respectively."
			],
			"code": [
				"// Example",
				"var firstName = \"Alan\";",
				"var lastName = \"Turing\";",
				"",
				"// Only change code below this line",
				"",
				""
			],
			"solutions": [
				"var myFirstName = \"Alan\";\nvar myLastName = \"Turing\";"
			],
			"tests": [
				"assert((function(){if(typeof myFirstName !== \"undefined\" && typeof myFirstName === \"string\" && myFirstName.length > 0){return true;}else{return false;}})(), 'message: <code>myFirstName</code> should be a string with at least one character in it.');",
				"assert((function(){if(typeof myLastName !== \"undefined\" && typeof myLastName === \"string\" && myLastName.length > 0){return true;}else{return false;}})(), 'message: <code>myLastName</code> should be a string with at least one character in it.');"
			]
		},
		"declareString": C.En(0)
	},
	"escapingQoutesString": {
		"$meta": {
			"name": "Escaping Literal Quotes in Strings",
			"icon": "code",
			"description": [
				"When you are defining a string you must start and end with a single or double quote. What happens when you need a literal quote: <code>\"</code> or <code>'</code> inside of your string?",
				"In JavaScript, you can <dfn>escape</dfn> a quote from considering it as an end of string quote by placing a <dfn>backslash</dfn> (<code>\\</code>) in front of the quote.",
				"<code>var sampleStr = \"Alan said, \\\"Peter is learning JavaScript\\\".\";</code>",
				"This signals to JavaScript that the following quote is not the end of the string, but should instead appear inside the string. So if you were to print this to the console, you would get:",
				"<code>Alan said, \"Peter is learning JavaScript\".</code>",
				"<hr>",
				"Use <dfn>backslashes</dfn> to assign a string to the <code>myStr</code> variable so that if you were to print it to the console, you would see:",
				"<code>I am a \"double quoted\" string inside \"double quotes\".</code>"
			],
			"code": [
				"var myStr = \"\"; // Change this line",
				"",
				""
			],
			"solutions": [],
			"tests": [
				"assert(code.match(/\\\\\"/g).length === 6 && code.match(/[^\\\\]\"/g).length === 10, 'message: You should use two double quotes (<code>&quot;</code>) and four escaped double quotes (<code>&#92;&quot;</code>).');",
				"assert(myStr === \"I am a \\\"double quoted\\\" string inside \\\"double quotes\\\".\", 'message: Variable myStr should contain the string: <code>I am a \"double quoted\" string inside \"double quotes\".</code>');"
			]
		},
		"escapingQoutesString": C.En(0)
	},
	"qoutingWithSingleQoutes": {
		"$meta": {
			"name": "Quoting Strings with Single Quotes",
			"icon": "code",
			"description": [
				"<dfn>String</dfn> values in JavaScript may be written with single or double quotes, so long as you start and end with the same type of quote. Unlike some languages, single and double quotes are functionally identical in JavaScript.",
				"<blockquote>\"This string has \\\"double quotes\\\" in it\"</blockquote>",
				"The value in using one or the other has to do with the need to <dfn>escape</dfn> quotes of the same type. Unless they are escaped, you cannot have more than one pair of whichever quote type begins a string.",
				"If you have a string with many double quotes, this can be difficult to read and write. Instead, use single quotes:",
				"<blockquote>'This string has \"double quotes\" in it. And \"probably\" lots of them.'</blockquote>",
				"<hr>",
				"Change the provided string from double to single quotes and remove the escaping. Do not change anything else."
			],
			"code": [
				"var myStr = \"<a href=\\\"http://www.example.com\\\" target=\\\"_blank\\\">Link</a>\";",
				"",
				""
			],
			"solutions": [
				"/* head */ 'use strict'; /* solution */ var myStr = '<a href=\"http://www.example.com\" target=\"_blank\">Link</a>'; /* tail */ (function() { return \"myStr = \" + myStr; })();"
			],
			"tests": [
				"assert(!/\\\\/g.test(code) && myStr === '<a href=\"http://www.example.com\" target=\"_blank\">Link</a>', 'message: Remove all the <code>backslashes</code> (<code>\\</code>)');",
				"assert(code.match(/\"/g).length === 6 && code.match(/'/g).length === 4, 'message: You should have two single quotes <code>&#39;</code> and four double quotes <code>&quot;</code>');"
			]
		},
		"qoutingWithSingleQoutes": C.En(0)
	},
	"escapeSequences": {
		"$meta": {
			"name": "Escape Sequences in Strings",
			"icon": "code",
			"description": [
				"Quotes are not the only characters that can be <dfn>escaped</dfn> inside a string. There are two reasons to use escaping characters: First is to allow you to use characters you might not otherwise be able to type out, such as a backspace. Second is to allow you to represent multiple quotes in a string without JavaScript misinterpreting what you mean. We learned this in the previous challenge.",
				"<table class=\"table table-striped\"><thead><tr><th>Code</th><th>Output</th></tr></thead><tbody><tr><td><code>\\'</code></td><td>single quote</td></tr><tr><td><code>\\\"</code></td><td>double quote</td></tr><tr><td><code>\\\\</code></td><td>backslash</td></tr><tr><td><code>\\n</code></td><td>newline</td></tr><tr><td><code>\\r</code></td><td>carriage return</td></tr><tr><td><code>\\t</code></td><td>tab</td></tr><tr><td><code>\\b</code></td><td>backspace</td></tr><tr><td><code>\\f</code></td><td>form feed</td></tr></tbody></table>",
				"<em>Note that the backslash itself must be escaped in order to display as a backslash.</em>",
				"<hr>",
				"Assign the following three lines of text into the single variable <code>myStr</code> using escape sequences.",
				"<blockquote>FirstLine<br/>&nbsp;&nbsp;&nbsp;&nbsp;\\SecondLine<br/>ThirdLine</blockquote>",
				"You will need to use escape sequences to insert special characters correctly. You will also need to follow the spacing as it looks above, with no spaces between escape sequences or words.",
				"Here is the text with the escape sequences written out.",
				"<q>FirstLine<code>newline</code><code>tab</code><code>backslash</code>SecondLine<code>newline</code>ThirdLine</q>"
			],
			"code": [
				"var myStr; // Change this line",
				"",
				""
			],
			"solutions": [
				"var myStr = \"FirstLine\\n\\t\\\\SecondLine\\nThirdLine\";"
			],
			"tests": [
				"assert(!/ /.test(myStr), 'message: <code>myStr</code> should not contain any spaces');",
				"assert(/FirstLine/.test(myStr) && /SecondLine/.test(myStr) && /ThirdLine/.test(myStr), 'message: <code>myStr</code> should contain the strings <code>FirstLine</code>, <code>SecondLine</code> and <code>ThirdLine</code> (remember case sensitivity)');",
				"assert(/FirstLine\\n/.test(myStr), 'message: <code>FirstLine</code> should be followed by the newline character <code>\\n</code>');",
				"assert(/\\n\\t/.test(myStr), 'message: <code>myStr</code> should contain a tab character <code>\\t</code> which follows a newline character');",
				"assert(/\\SecondLine/.test(myStr), 'message: <code>SecondLine</code> should be preceded by the backslash character <code>\\\\</code>');",
				"assert(/SecondLine\\nThirdLine/.test(myStr), 'message: There should be a newline character between <code>SecondLine</code> and <code>ThirdLine</code>');"
			]
		},
		"escapeSequences": C.En(0)
	},
	"concatenatingStringPlus": {
		"$meta": {
			"name": "Concatenating Strings with Plus Operator",
			"icon": "code",
			"description": [
				"In JavaScript, when the <code>+</code> operator is used with a <code>String</code> value, it is called the <dfn>concatenation</dfn> operator. You can build a new string out of other strings by <dfn>concatenating</dfn> them together.",
				"<strong>Example</strong>",
				"<blockquote>'My name is Alan,' + ' I concatenate.'</blockquote>",
				"<strong>Note</strong><br>Watch out for spaces. Concatenation does not add spaces between concatenated strings, so you'll need to add them yourself.",
				"<hr>",
				"Build <code>myStr</code> from the strings <code>\"This is the start. \"</code> and <code>\"This is the end.\"</code> using the <code>+</code> operator."
			],
			"code": [
				"// Example",
				"var ourStr = \"I come first. \" + \"I come second.\";",
				"",
				"// Only change code below this line",
				"",
				"var myStr;",
				"",
				""
			],
			"solutions": [
				"var ourStr = \"I come first. \" + \"I come second.\";\nvar myStr = \"This is the start. \" + \"This is the end.\";"
			],
			"tests": [
				"assert(myStr === \"This is the start. This is the end.\", 'message: <code>myStr</code> should have a value of <code>This is the start. This is the end.</code>');",
				"assert(code.match(/([\"']).*([\"'])\\s*\\+\\s*([\"']).*([\"'])/g).length > 1, 'message: Use the <code>+</code> operator to build <code>myStr</code>');",
				"assert(/var\\s+myStr/.test(code), 'message: <code>myStr</code> should be created using the <code>var</code> keyword.');",
				"assert(/myStr\\s*=/.test(code), 'message: Make sure to assign the result to the <code>myStr</code> variable.');"
			]
		},
		"concatenatingStringPlus": C.En(0)
	},
	"concatenatingStringPlusEquals": {
		"$meta": {
			"name": "Concatenating Strings with the Plus Equals Operator",
			"icon": "code",
			"description": [
				"We can also use the <code>+=</code> operator to <dfn>concatenate</dfn> a string onto the end of an existing string variable. This can be very helpful to break a long string over several lines.",
				"<strong>Note</strong><br>Watch out for spaces. Concatenation does not add spaces between concatenated strings, so you'll need to add them yourself.",
				"<hr>",
				"Build <code>myStr</code> over several lines by concatenating these two strings:<br><code>\"This is the first sentence. \"</code> and <code>\"This is the second sentence.\"</code> using the <code>+=</code> operator."
			],
			"code": [
				"// Example",
				"var ourStr = \"I come first. \";",
				"ourStr += \"I come second.\";",
				"",
				"// Only change code below this line",
				"",
				"var myStr;",
				"",
				""
			],
			"solutions": [
				"var ourStr = \"I come first. \";\nourStr += \"I come second.\";\n\nvar myStr = \"This is the first sentence. \";\nmyStr += \"This is the second sentence.\";"
			],
			"tests": [
				"assert(myStr === \"This is the first sentence. This is the second sentence.\", 'message: <code>myStr</code> should have a value of <code>This is the first sentence. This is the second sentence.</code>');",
				"assert(code.match(/\\w\\s*\\+=\\s*[\"']/g).length > 1 && code.match(/\\w\\s*\\=\\s*[\"']/g).length > 1, 'message: Use the <code>+=</code> operator to build <code>myStr</code>');"
			]
		},
		"concatenatingStringPlusEquals": C.En(0)
	},
	"constructingStringVariables": {
		"$meta": {
			"name": "Constructing Strings with Variables",
			"icon": "code",
			"description": [
				"Sometimes you will need to build a string, <a href=\"https://en.wikipedia.org/wiki/Mad_Libs\" target=\"_blank\">Mad Libs</a> style. By using the concatenation operator (<code>+</code>), you can insert one or more variables into a string you're building.",
				"<hr>",
				"Set <code>myName</code> to a string equal to your name and build <code>myStr</code> with <code>myName</code> between the strings <code>\"My name is \"</code> and <code>\" and I am well!\"</code>"
			],
			"code": [
				"// Example",
				"var ourName = \"freeCodeCamp\";",
				"var ourStr = \"Hello, our name is \" + ourName + \", how are you?\";",
				"",
				"// Only change code below this line",
				"var myName;",
				"var myStr;",
				"",
				""
			],
			"solutions": [
				"var myName = \"Bob\";\nvar myStr = \"My name is \" + myName + \" and I am well!\";"
			],
			"tests": [
				"assert(typeof myName !== 'undefined' && myName.length > 2, 'message: <code>myName</code> should be set to a string at least 3 characters long');",
				"assert(code.match(/[\"']\\s*\\+\\s*myName\\s*\\+\\s*[\"']/g).length > 0, 'message: Use two <code>+</code> operators to build <code>myStr</code> with <code>myName</code> inside it');"
			]
		},
		"constructingStringVariables": C.En(0)
	},
	"appendingStringToVariable": {
		"$meta": {
			"name": "Appending Variables to Strings",
			"icon": "code",
			"description": [
				"Just as we can build a string over multiple lines out of string <dfn>literals</dfn>, we can also append variables to a string using the plus equals (<code>+=</code>) operator.",
				"<hr>",
				"Set <code>someAdjective</code> and append it to <code>myStr</code> using the <code>+=</code> operator."
			],
			"code": [
				"// Example",
				"var anAdjective = \"awesome!\";",
				"var ourStr = \"freeCodeCamp is \";",
				"ourStr += anAdjective;",
				"",
				"// Only change code below this line",
				"",
				"var someAdjective;",
				"var myStr = \"Learning to code is \";",
				""
			],
			"solutions": [
				"var anAdjective = \"awesome!\";\nvar ourStr = \"freeCodeCamp is \";\nourStr += anAdjective;\n\nvar someAdjective = \"neat\";\nvar myStr = \"Learning to code is \";\nmyStr += someAdjective;"
			],
			"tests": [
				"assert(typeof someAdjective !== 'undefined' && someAdjective.length > 2, 'message: <code>someAdjective</code> should be set to a string at least 3 characters long');",
				"assert(code.match(/myStr\\s*\\+=\\s*someAdjective\\s*/).length > 0, 'message: Append <code>someAdjective</code> to <code>myStr</code> using the <code>+=</code> operator');"
			]
		},
		"appendingStringToVariable": C.En(0)
	},
	"stringLength": {
		"$meta": {
			"name": "Find the Length of a String",
			"icon": "code",
			"description": [
				"You can find the length of a <code>String</code> value by writing <code>.length</code> after the string variable or string literal.",
				"<code>\"Alan Peter\".length; // 10</code>",
				"For example, if we created a variable <code>var firstName = \"Charles\"</code>, we could find out how long the string <code>\"Charles\"</code> is by using the <code>firstName.length</code> property.",
				"<hr>",
				"Use the <code>.length</code> property to count the number of characters in the <code>lastName</code> variable and assign it to <code>lastNameLength</code>."
			],
			"code": [
				"// Example",
				"var firstNameLength = 0;",
				"var firstName = \"Ada\";",
				"",
				"firstNameLength = firstName.length;",
				"",
				"// Setup",
				"var lastNameLength = 0;",
				"var lastName = \"Lovelace\";",
				"",
				"// Only change code below this line.",
				"",
				"lastNameLength = lastName;",
				"",
				""
			],
			"solutions": [
				"var firstNameLength = 0;\nvar firstName = \"Ada\";\nfirstNameLength = firstName.length;\n\nvar lastNameLength = 0;\nvar lastName = \"Lovelace\";\nlastNameLength = lastName.length;"
			],
			"tests": [
				"assert((function(){if(typeof lastNameLength !== \"undefined\" && typeof lastNameLength === \"number\" && lastNameLength === 8){return true;}else{return false;}})(), 'message: <code>lastNameLength</code> should be equal to eight.');",
				"assert((function(){if(code.match(/\\.length/gi) && code.match(/\\.length/gi).length >= 2 && code.match(/var lastNameLength \\= 0;/gi) && code.match(/var lastNameLength \\= 0;/gi).length >= 1){return true;}else{return false;}})(), 'message: You should be getting the length of <code>lastName</code> by using <code>.length</code> like this: <code>lastName.length</code>.');"
			]
		},
		"stringLength": C.En(0)
	},
	"findFirstCharacterBrackets": {
		"$meta": {
			"name": "Use Bracket Notation to Find the First Character in a String",
			"icon": "code",
			"description": [
				"<code>Bracket notation</code> is a way to get a character at a specific <code>index</code> within a string.",
				"Most modern programming languages, like JavaScript, don't start counting at 1 like humans do. They start at 0. This is referred to as <dfn>Zero-based</dfn> indexing.",
				"For example, the character at index 0 in the word \"Charles\" is \"C\". So if <code>var firstName = \"Charles\"</code>, you can get the value of the first letter of the string by using <code>firstName[0]</code>.",
				"<hr>",
				"Use <dfn>bracket notation</dfn> to find the first character in the <code>lastName</code> variable and assign it to <code>firstLetterOfLastName</code>.",
				"<strong>Hint</strong><br>Try looking at the <code>firstLetterOfFirstName</code> variable declaration if you get stuck."
			],
			"code": [
				"// Example",
				"var firstLetterOfFirstName = \"\";",
				"var firstName = \"Ada\";",
				"",
				"firstLetterOfFirstName = firstName[0];",
				"",
				"// Setup",
				"var firstLetterOfLastName = \"\";",
				"var lastName = \"Lovelace\";",
				"",
				"// Only change code below this line",
				"firstLetterOfLastName = lastName;",
				"",
				""
			],
			"solutions": [
				"var firstLetterOfLastName = \"\";\nvar lastName = \"Lovelace\";\n\n// Only change code below this line\nfirstLetterOfLastName = lastName[0];"
			],
			"tests": [
				"assert(firstLetterOfLastName === 'L', 'message: The <code>firstLetterOfLastName</code> variable should have the value of <code>L</code>.');",
				"assert(code.match(/firstLetterOfLastName\\s*?=\\s*?lastName\\[.*?\\]/), 'message: You should use bracket notation.');"
			]
		},
		"findFirstCharacterBrackets": C.En(0)
	},
	"stringImmutability": {
		"$meta": {
			"name": "Understand String Immutability",
			"icon": "code",
			"description": [
				"In JavaScript, <code>String</code> values are <dfn>immutable</dfn>, which means that they cannot be altered once created.",
				"For example, the following code:",
				"<blockquote>var myStr = \"Bob\";<br>myStr[0] = \"J\";</blockquote>",
				"cannot change the value of <code>myStr</code> to \"Job\", because the contents of <code>myStr</code> cannot be altered. Note that this does <em>not</em> mean that <code>myStr</code> cannot be changed, just that the individual characters of a <dfn>string literal</dfn> cannot be changed. The only way to change <code>myStr</code> would be to assign it with a new string, like this:",
				"<blockquote>var myStr = \"Bob\";<br>myStr = \"Job\";</blockquote>",
				"<hr>",
				"Correct the assignment to <code>myStr</code> so it contains the string value of <code>Hello World</code> using the approach shown in the example above."
			],
			"code": [
				"// Setup",
				"var myStr = \"Jello World\";",
				"",
				"// Only change code below this line",
				"",
				"myStr[0] = \"H\"; // Fix Me",
				"",
				""
			],
			"solutions": [
				"var myStr = \"Jello World\";\nmyStr = \"Hello World\";"
			],
			"tests": [
				"assert(myStr === \"Hello World\", 'message: <code>myStr</code> should have a value of <code>Hello World</code>');",
				"assert(/myStr = \"Jello World\"/.test(code), 'message: Do not change the code above the line');"
			]
		},
		"stringImmutability": C.En(0)
	},
	"findNthCharacterBrackets": {
		"$meta": {
			"name": "Use Bracket Notation to Find the Nth Character in a String",
			"icon": "code",
			"description": [
				"You can also use <dfn>bracket notation</dfn> to get the character at other positions within a string.",
				"Remember that computers start counting at <code>0</code>, so the first character is actually the zeroth character.",
				"<hr>",
				"Let's try to set <code>thirdLetterOfLastName</code> to equal the third letter of the <code>lastName</code> variable using bracket notation.",
				"<strong>Hint</strong><br>Try looking at the <code>secondLetterOfFirstName</code> variable declaration if you get stuck."
			],
			"code": [
				"// Example",
				"var firstName = \"Ada\";",
				"var secondLetterOfFirstName = firstName[1];",
				"",
				"// Setup",
				"var lastName = \"Lovelace\";",
				"",
				"// Only change code below this line.",
				"var thirdLetterOfLastName = lastName;",
				"",
				""
			],
			"solutions": [
				"var lastName = \"Lovelace\";\nvar thirdLetterOfLastName = lastName[2];"
			],
			"tests": [
				"assert(thirdLetterOfLastName === 'v', 'message: The <code>thirdLetterOfLastName</code> variable should have the value of <code>v</code>.');",
				"assert(code.match(/thirdLetterOfLastName\\s*?=\\s*?lastName\\[.*?\\]/), 'message: You should use bracket notation.');"
			]
		},
		"findNthCharacterBrackets": C.En(0)
	},
	"stringLastCharacter": {
		"$meta": {
			"name": "Use Bracket Notation to Find the Last Character in a String",
			"icon": "code",
			"description": [
				"In order to get the last letter of a string, you can subtract one from the string's length.",
				"For example, if <code>var firstName = \"Charles\"</code>, you can get the value of the last letter of the string by using <code>firstName[firstName.length - 1]</code>.",
				"<hr>",
				"Use <dfn>bracket notation</dfn> to find the last character in the <code>lastName</code> variable.",
				"<strong>Hint</strong><br>Try looking at the <code>lastLetterOfFirstName</code> variable declaration if you get stuck."
			],
			"code": [
				"// Example",
				"var firstName = \"Ada\";",
				"var lastLetterOfFirstName = firstName[firstName.length - 1];",
				"",
				"// Setup",
				"var lastName = \"Lovelace\";",
				"",
				"// Only change code below this line.",
				"var lastLetterOfLastName = lastName;",
				"",
				""
			],
			"solutions": [
				"var firstName = \"Ada\";\nvar lastLetterOfFirstName = firstName[firstName.length - 1];\n\nvar lastName = \"Lovelace\";\nvar lastLetterOfLastName = lastName[lastName.length - 1];"
			],
			"tests": [
				"assert(lastLetterOfLastName === \"e\", 'message: <code>lastLetterOfLastName</code> should be \"e\".');",
				"assert(code.match(/\\.length/g).length === 2, 'message: You have to use <code>.length</code> to get the last letter.');"
			]
		},
		"stringLastCharacter": C.En(0)
	},
	"stringFindNthToLast": {
		"$meta": {
			"name": "Use Bracket Notation to Find the Nth-to-Last Character in a String",
			"icon": "code",
			"description": [
				"You can use the same principle we just used to retrieve the last character in a string to retrieve the Nth-to-last character.",
				"For example, you can get the value of the third-to-last letter of the <code>var firstName = \"Charles\"</code> string by using <code>firstName[firstName.length - 3]</code>",
				"<hr>",
				"Use <dfn>bracket notation</dfn> to find the second-to-last character in the <code>lastName</code> string.",
				"<strong>Hint</strong><br>Try looking at the <code>thirdToLastLetterOfFirstName</code> variable declaration if you get stuck."
			],
			"code": [
				"// Example",
				"var firstName = \"Ada\";",
				"var thirdToLastLetterOfFirstName = firstName[firstName.length - 3];",
				"",
				"// Setup",
				"var lastName = \"Lovelace\";",
				"",
				"// Only change code below this line",
				"var secondToLastLetterOfLastName = lastName;",
				"",
				""
			],
			"solutions": [
				"var firstName = \"Ada\";\nvar thirdToLastLetterOfFirstName = firstName[firstName.length - 3];\n\nvar lastName = \"Lovelace\";\nvar secondToLastLetterOfLastName = lastName[lastName.length - 2];"
			],
			"tests": [
				"assert(secondToLastLetterOfLastName === 'c', 'message: <code>secondToLastLetterOfLastName</code> should be \"c\".');",
				"assert(code.match(/\\.length/g).length === 2, 'message: You have to use <code>.length</code> to get the second last letter.');"
			]
		},
		"stringFindNthToLast": C.En(0)
	},
	"wordBlanks": {
		"$meta": {
			"name": "Word Blanks",
			"icon": "code",
			"description": [
				"We will now use our knowledge of strings to build a \"<a href='https://en.wikipedia.org/wiki/Mad_Libs' target='_blank'>Mad Libs</a>\" style word game we're calling \"Word Blanks\". You will create an (optionally humorous) \"Fill in the Blanks\" style sentence. Here's an example of an incomplete sentence.",
				"<code>\"The ______ ______ looked around ______ then ______ into the house\"</code>",
				"These four blanks would be filled in this order: (adjective) (noun) (adverb) (verb)",
				"You will need to use string concatenation to build a new string, <code>result</code>, using the variables <code>myNoun</code>, <code>myAdjective</code>, <code>myVerb</code>, and <code>myAdverb</code>. These variables are passed to the function as parameters. Don't change these parameter names in the function.",
				"Include additional strings and spaces (which will not change) in between the provided variables to make a complete sentence."
			],
			"code": [
				"function wordBlanks(myNoun, myAdjective, myVerb, myAdverb) {",
				"  var result = \"\";",
				"  // Your code below this line",
				"  ",
				"",
				"  // Your code above this line",
				"  return result;",
				"}",
				"",
				"// Change the words here to test your function",
				"wordBlanks(\"dog\", \"big\", \"ran\", \"quickly\");"
			],
			"solutions": [
				"function wordBlanks(myNoun, myAdjective, myVerb, myAdverb) {\n  var result = \"\";\n\n  result = \"Once there was a \" + myNoun + \" which was very \" + myAdjective + \". \";\n  result += \"It \" + myVerb + \" \" + myAdverb + \" around the yard.\";\n\n  return result;\n}"
			],
			"tests": [
				"assert(typeof wordBlanks(\"\",\"\",\"\",\"\") === 'string', 'message: <code>wordBlanks(\"\",\"\",\"\",\"\")</code> should return a string.');",
				"assert(/\\bdog\\b/.test(test1) && /\\bbig\\b/.test(test1) && /\\bran\\b/.test(test1) && /\\bquickly\\b/.test(test1),'message: <code>wordBlanks(\"dog\", \"big\", \"ran\", \"quickly\")</code> should contain all of the passed in words separated by non-word characters (and any additional words in your madlib).');",
				"assert(/\\bcat\\b/.test(test2) && /\\blittle\\b/.test(test2) && /\\bhit\\b/.test(test2) && /\\bslowly\\b/.test(test2),'message: <code>wordBlanks(\"cat\", \"little\", \"hit\", \"slowly\")</code> should contain all of the passed in words separated by non-word characters (and any additional words in your madlib).');"
			]
		},
		"wordBlanks": C.En(0)
	},
	"arrayVariable": {
		"$meta": {
			"name": "Store Multiple Values in one Variable using JavaScript Arrays",
			"icon": "code",
			"description": [
				"With JavaScript <code>array</code> variables, we can store several pieces of data in one place.",
				"You start an array declaration with an opening square bracket, end it with a closing square bracket, and put a comma between each entry, like this: ",
				"<code>var sandwich = [\"peanut butter\", \"jelly\", \"bread\"]</code>.",
				"<hr>",
				"Modify the new array <code>myArray</code> so that it contains both a <code>string</code> and a <code>number</code> (in that order).",
				"<strong>Hint</strong><br>Refer to the example code in the text editor if you get stuck."
			],
			"code": [
				"// Example",
				"var ourArray = [\"John\", 23];",
				"",
				"// Only change code below this line.",
				"var myArray = [];",
				""
			],
			"solutions": [
				"var myArray = [\"The Answer\", 42];"
			],
			"tests": [
				"assert(typeof myArray == 'object', 'message: <code>myArray</code> should be an <code>array</code>.');",
				"assert(typeof myArray[0] !== 'undefined' && typeof myArray[0] == 'string', 'message: The first item in <code>myArray</code> should be a <code>string</code>.');",
				"assert(typeof myArray[1] !== 'undefined' && typeof myArray[1] == 'number', 'message: The second item in <code>myArray</code> should be a <code>number</code>.');"
			]
		},
		"arrayVariable": C.En(0)
	},
	"nestArrays": {
		"$meta": {
			"name": "Nest one Array within Another Array",
			"icon": "code",
			"description": [
				"You can also nest arrays within other arrays, like this: <code>[[\"Bulls\", 23], [\"White Sox\", 45]]</code>. This is also called a <dfn>Multi-dimensional Array<dfn>.",
				"<hr>",
				"Create a nested array called <code>myArray</code>."
			],
			"code": [
				"// Example",
				"var ourArray = [[\"the universe\", 42], [\"everything\", 101010]];",
				"",
				"// Only change code below this line.",
				"var myArray = [];",
				""
			],
			"solutions": [
				"var myArray = [[1,2,3]];"
			],
			"tests": [
				"assert(Array.isArray(myArray) && myArray.some(Array.isArray), 'message: <code>myArray</code> should have at least one array nested within another array.');"
			]
		},
		"nestArrays": C.En(0)
	},
	"arrayIndexes": {
		"$meta": {
			"name": "Access Array Data with Indexes",
			"icon": "code",
			"description": [
				"We can access the data inside arrays using <code>indexes</code>.",
				"Array indexes are written in the same bracket notation that strings use, except that instead of specifying a character, they are specifying an entry in the array. Like strings, arrays use <dfn>zero-based</dfn> indexing, so the first element in an array is element <code>0</code>.",
				"<strong>Example</strong>",
				"<blockquote>var array = [1,2,3];<br>array[0]; // equals 1<br>var data = array[1];  // equals 2</blockquote>",
				"<strong>Note</strong><br>There shouldn't be any spaces between the array name and the square brackets, like <code>array [0]</code>. Although JavaScript is able to process this correctly, this may confuse other programmers reading your code.",
				"<hr>",
				"Create a variable called <code>myData</code> and set it to equal the first value of <code>myArray</code> using bracket notation."
			],
			"code": [
				"// Example",
				"var ourArray = [1,2,3];",
				"var ourData = ourArray[0]; // equals 1",
				"",
				"// Setup",
				"var myArray = [1,2,3];",
				"",
				"// Only change code below this line.",
				""
			],
			"solutions": [
				"var myArray = [1,2,3];\nvar myData = myArray[0];"
			],
			"tests": [
				"assert((function(){if(typeof myArray !== 'undefined' && typeof myData !== 'undefined' && myArray[0] === myData){return true;}else{return false;}})(), 'message: The variable <code>myData</code> should equal the first value of <code>myArray</code>.');",
				"assert((function(){if(code.match(/\\s*=\\s*myArray\\[0\\]/g)){return true;}else{return false;}})(), 'message: The data in variable <code>myArray</code> should be accessed using bracket notation.');"
			]
		},
		"arrayIndexes": C.En(0)
	},
	"modifyArray": {
		"$meta": {
			"name": "Modify Array Data With Indexes",
			"icon": "code",
			"description": [
				"Unlike strings, the entries of arrays are <dfn>mutable</dfn> and can be changed freely.",
				"<strong>Example</strong>",
				"<blockquote>var ourArray = [3,2,1];<br>ourArray[0] = 1; // equals [1,2,1]</blockquote>",
				"<strong>Note</strong><br>There shouldn't be any spaces between the array name and the square brackets, like <code>array [0]</code>. Although JavaScript is able to process this correctly, this may confuse other programmers reading your code.",
				"<hr>",
				"Modify the data stored at index <code>0</code> of <code>myArray</code> to a value of <code>3</code>."
			],
			"code": [
				"// Example",
				"var ourArray = [1,2,3];",
				"ourArray[1] = 3; // ourArray now equals [1,3,3].",
				"",
				"// Setup",
				"var myArray = [1,2,3];",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var myArray = [1,2,3];\nmyArray[0] = 3;"
			],
			"tests": [
				"assert((function(){if(typeof myArray != 'undefined' && myArray[0] == 3 && myArray[1] == 2 && myArray[2] == 3){return true;}else{return false;}})(), 'message: <code>myArray</code> should now be [3,2,3].');",
				"assert((function(){if(code.match(/myArray\\[0\\]\\s*=\\s*/g)){return true;}else{return false;}})(), 'message: You should be using correct index to modify the value in <code>myArray</code>.');"
			]
		},
		"modifyArray": C.En(0)
	},
	"multiDimensionalArray": {
		"$meta": {
			"name": "Access Multi-Dimensional Arrays With Indexes",
			"icon": "code",
			"description": [
				"One way to think of a <dfn>multi-dimensional</dfn> array, is as an <em>array of arrays</em>. When you use brackets to access your array, the first set of brackets refers to the entries in the outer-most (the first level) array, and each additional pair of brackets refers to the next level of entries inside.",
				"<strong>Example</strong>",
				"<blockquote>var arr = [<br>    [1,2,3],<br>    [4,5,6],<br>    [7,8,9],<br>    [[10,11,12], 13, 14]<br>];<br>arr[3]; // equals [[10,11,12], 13, 14]<br>arr[3][0]; // equals [10,11,12]<br>arr[3][0][1]; // equals 11</blockquote>",
				"<strong>Note</strong><br>There shouldn't be any spaces between the array name and the square brackets, like <code>array [0][0]</code> and even this <code>array [0] [0]</code> is not allowed. Although JavaScript is able to process this correctly, this may confuse other programmers reading your code.",
				"<hr>",
				"Using bracket notation select an element from <code>myArray</code> such that <code>myData</code> is equal to <code>8</code>."
			],
			"code": [
				"// Setup",
				"var myArray = [[1,2,3], [4,5,6], [7,8,9], [[10,11,12], 13, 14]];",
				"",
				"// Only change code below this line.",
				"var myData = myArray[0][0];",
				""
			],
			"solutions": [
				"var myArray = [[1,2,3],[4,5,6], [7,8,9], [[10,11,12], 13, 14]];\nvar myData = myArray[2][1];"
			],
			"tests": [
				"assert(myData === 8, 'message: <code>myData</code> should be equal to <code>8</code>.');",
				"assert(/myArray\\[2\\]\\[1\\]/g.test(code) && !/myData\\s*=\\s*(?:.*[-+*/%]|\\d)/g.test(code), 'message: You should be using bracket notation to read the correct value from <code>myArray</code>.');"
			]
		},
		"multiDimensionalArray": C.En(0)
	},
	"arrayPush": {
		"$meta": {
			"name": "Manipulate Arrays With push()",
			"icon": "code",
			"description": [
				"An easy way to append data to the end of an array is via the <code>push()</code> function.",
				"<code>.push()</code> takes one or more <dfn>parameters</dfn> and \"pushes\" them onto the end of the array.",
				"<blockquote>var arr = [1,2,3];<br>arr.push(4);<br>// arr is now [1,2,3,4]</blockquote>",
				"<hr>",
				"Push <code>[\"dog\", 3]</code> onto the end of the <code>myArray</code> variable."
			],
			"code": [
				"// Example",
				"var ourArray = [\"Stimpson\", \"J\", \"cat\"];",
				"ourArray.push([\"happy\", \"joy\"]); ",
				"// ourArray now equals [\"Stimpson\", \"J\", \"cat\", [\"happy\", \"joy\"]]",
				"",
				"// Setup",
				"var myArray = [[\"John\", 23], [\"cat\", 2]];",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var myArray = [[\"John\", 23], [\"cat\", 2]];\nmyArray.push([\"dog\",3]);"
			],
			"tests": [
				"assert((function(d){if(d[2] != undefined && d[0][0] == 'John' && d[0][1] === 23 && d[2][0] == 'dog' && d[2][1] === 3 && d[2].length == 2){return true;}else{return false;}})(myArray), 'message: <code>myArray</code> should now equal <code>[[\"John\", 23], [\"cat\", 2], [\"dog\", 3]]</code>.');"
			]
		},
		"arrayPush": C.En(0)
	},
	"arrayPop": {
		"$meta": {
			"name": "Manipulate Arrays With pop()",
			"icon": "code",
			"description": [
				"Another way to change the data in an array is with the <code>.pop()</code> function.",
				"<code>.pop()</code> is used to \"pop\" a value off of the end of an array. We can store this \"popped off\" value by assigning it to a variable. In other words, <code>.pop()</code> removes the last element from an array and returns that element.",
				"Any type of entry can be \"popped\" off of an array - numbers, strings, even nested arrays.",
				"<blockquote><code>var threeArr = [1, 4, 6];<br> var oneDown = threeArr.pop();<br> console.log(oneDown); // Returns 6<br> console.log(threeArr); // Returns [1, 4]</code></blockquote>",
				"<hr>",
				"Use the <code>.pop()</code> function to remove the last item from <code>myArray</code>, assigning the \"popped off\" value to <code>removedFromMyArray</code>."
			],
			"code": [
				"// Example",
				"var ourArray = [1,2,3];",
				"var removedFromOurArray = ourArray.pop(); ",
				"// removedFromOurArray now equals 3, and ourArray now equals [1,2]",
				"",
				"// Setup",
				"var myArray = [[\"John\", 23], [\"cat\", 2]];",
				"",
				"// Only change code below this line.",
				"var removedFromMyArray;",
				"",
				""
			],
			"solutions": [
				"var myArray = [[\"John\", 23], [\"cat\", 2]];\nvar removedFromMyArray = myArray.pop();"
			],
			"tests": [
				"assert((function(d){if(d[0][0] == 'John' && d[0][1] === 23 && d[1] == undefined){return true;}else{return false;}})(myArray), 'message: <code>myArray</code> should only contain <code>[[\"John\", 23]]</code>.');",
				"assert(/removedFromMyArray\\s*=\\s*myArray\\s*.\\s*pop\\s*(\\s*)/.test(code), 'message: Use <code>pop()</code> on <code>myArray</code>');",
				"assert((function(d){if(d[0] == 'cat' && d[1] === 2 && d[2] == undefined){return true;}else{return false;}})(removedFromMyArray), 'message: <code>removedFromMyArray</code> should only contain <code>[\"cat\", 2]</code>.');"
			]
		},
		"arrayPop": C.En(0)
	},
	"arrayShift": {
		"$meta": {
			"name": "Manipulate Arrays With shift()",
			"icon": "code",
			"description": [
				"<code>pop()</code> always removes the last element of an array. What if you want to remove the first?",
				"That's where <code>.shift()</code> comes in. It works just like <code>.pop()</code>, except it removes the first element instead of the last.",
				"<hr>",
				"Use the <code>.shift()</code> function to remove the first item from <code>myArray</code>, assigning the \"shifted off\" value to <code>removedFromMyArray</code>."
			],
			"code": [
				"// Example",
				"var ourArray = [\"Stimpson\", \"J\", [\"cat\"]];",
				"removedFromOurArray = ourArray.shift();",
				"// removedFromOurArray now equals \"Stimpson\" and ourArray now equals [\"J\", [\"cat\"]].",
				"",
				"// Setup",
				"var myArray = [[\"John\", 23], [\"dog\", 3]];",
				"",
				"// Only change code below this line.",
				"var removedFromMyArray;",
				"",
				""
			],
			"solutions": [
				"var myArray = [[\"John\", 23], [\"dog\", 3]];\n\n// Only change code below this line.\nvar removedFromMyArray = myArray.shift();"
			],
			"tests": [
				"assert((function(d){if(d[0][0] == 'dog' && d[0][1] === 3 && d[1] == undefined){return true;}else{return false;}})(myArray), 'message: <code>myArray</code> should now equal <code>[[\"dog\", 3]]</code>.');",
				"assert((function(d){if(d[0] == 'John' && d[1] === 23 && typeof removedFromMyArray === 'object'){return true;}else{return false;}})(removedFromMyArray), 'message: <code>removedFromMyArray</code> should contain <code>[\"John\", 23]</code>.');"
			]
		},
		"arrayShift": C.En(0)
	},
	"arrayUnshift": {
		"$meta": {
			"name": "Manipulate Arrays With unshift()",
			"icon": "code",
			"description": [
				"Not only can you <code>shift</code> elements off of the beginning of an array, you can also <code>unshift</code> elements to the beginning of an array i.e. add elements in front of the array.",
				"<code>.unshift()</code> works exactly like <code>.push()</code>, but instead of adding the element at the end of the array, <code>unshift()</code> adds the element at the beginning of the array.",
				"<hr>",
				"Add <code>[\"Paul\",35]</code> to the beginning of the <code>myArray</code> variable using <code>unshift()</code>."
			],
			"code": [
				"// Example",
				"var ourArray = [\"Stimpson\", \"J\", \"cat\"];",
				"ourArray.shift(); // ourArray now equals [\"J\", \"cat\"]",
				"ourArray.unshift(\"Happy\"); ",
				"// ourArray now equals [\"Happy\", \"J\", \"cat\"]",
				"",
				"// Setup",
				"var myArray = [[\"John\", 23], [\"dog\", 3]];",
				"myArray.shift();",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var myArray = [[\"John\", 23], [\"dog\", 3]];\nmyArray.shift();\nmyArray.unshift([\"Paul\", 35]);"
			],
			"tests": [
				"assert((function(d){if(typeof d[0] === \"object\" && d[0][0] == 'Paul' && d[0][1] === 35 && d[1][0] != undefined && d[1][0] == 'dog' && d[1][1] != undefined && d[1][1] == 3){return true;}else{return false;}})(myArray), 'message: <code>myArray</code> should now have [[\"Paul\", 35], [\"dog\", 3]].');"
			]
		},
		"arrayUnshift": C.En(0)
	},
	"shoppingList": {
		"$meta": {
			"name": "Shopping List",
			"icon": "code",
			"description": [
				"Create a shopping list in the variable <code>myList</code>. The list should be a multi-dimensional array containing several sub-arrays.",
				"The first element in each sub-array should contain a string with the name of the item. The second element should be a number representing the quantity i.e.",
				"<code>[\"Chocolate Bar\", 15]</code>",
				"There should be at least 5 sub-arrays in the list."
			],
			"code": [
				"var myList = [];",
				"",
				""
			],
			"solutions": [
				"var myList = [\n  [\"Candy\", 10],\n  [\"Potatoes\", 12],\n  [\"Eggs\", 12],\n  [\"Catfood\", 1],\n  [\"Toads\", 9]\n];"
			],
			"tests": [
				"assert(isArray, 'message: <code>myList</code> should be an array');",
				"assert(hasString, 'message: The first elements in each of your sub-arrays must all be strings');",
				"assert(hasNumber, 'message: The second elements in each of your sub-arrays must all be numbers');",
				"assert(count > 4, 'message: You must have at least 5 items in your list');"
			]
		},
		"shoppingList": C.En(0)
	},
	"reusableArrays": {
		"$meta": {
			"name": "Write Reusable JavaScript with Functions",
			"icon": "code",
			"description": [
				"In JavaScript, we can divide up our code into reusable parts called <dfn>functions</dfn>.",
				"Here's an example of a function:",
				"<blockquote>function functionName() {<br>  console.log(\"Hello World\");<br>}</blockquote>",
				"You can call or <dfn>invoke</dfn> this function by using its name followed by parentheses, like this:",
				"<code>functionName();</code>",
				"Each time the function is called it will print out the message <code>\"Hello World\"</code> on the dev console. All of the code between the curly braces will be executed every time the function is called.",
				"<hr>",
				"<ol><li>Create a function called <code>reusableFunction</code> which prints <code>\"Hi World\"</code> to the dev console.</li><li>Call the function.</li></ol>"
			],
			"code": [
				"// Example",
				"function ourReusableFunction() {",
				"  console.log(\"Heyya, World\");",
				"}",
				"",
				"ourReusableFunction();",
				"",
				"// Only change code below this line",
				""
			],
			"solutions": [
				"function reusableFunction() {\n  console.log(\"Hi World\");\n}\nreusableFunction();"
			],
			"tests": [
				"assert(typeof reusableFunction === 'function', 'message: <code>reusableFunction</code> should be a function');",
				"assert(\"Hi World\" === logOutput, 'message: <code>reusableFunction</code> should output \"Hi World\" to the dev console');",
				"assert(/^\\s*reusableFunction\\(\\)\\s*;/m.test(code), 'message: Call <code>reusableFunction</code> after you define it');"
			]
		},
		"reusableArrays": C.En(0)
	},
	"functionArguments": {
		"$meta": {
			"name": "Passing Values to Functions with Arguments",
			"icon": "code",
			"description": [
				"<dfn>Parameters</dfn> are variables that act as placeholders for the values that are to be input to a function when it is called. When a function is defined, it is typically defined along with one or more parameters. The actual values that are input (or <dfn>\"passed\"</dfn>) into a function when it is called are known as <dfn>arguments</dfn>.",
				"Here is a function with two parameters, <code>param1</code> and <code>param2</code>:",
				"<blockquote>function testFun(param1, param2) {<br>  console.log(param1, param2);<br>}</blockquote>",
				"Then we can call <code>testFun</code>:",
				"<code>testFun(\"Hello\", \"World\");</code>",
				"We have passed two arguments, <code>\"Hello\"</code> and <code>\"World\"</code>. Inside the function, <code>param1</code> will equal \"Hello\" and <code>param2</code> will equal \"World\". Note that you could call <code>testFun</code> again with different arguments and the parameters would take on the value of the new arguments.",
				"<hr>",
				"<ol><li>Create a function called <code>functionWithArgs</code> that accepts two arguments and outputs their sum to the dev console.</li><li>Call the function with two numbers as arguments.</li></ol>"
			],
			"code": [
				"// Example",
				"function ourFunctionWithArgs(a, b) {",
				"  console.log(a - b);",
				"}",
				"ourFunctionWithArgs(10, 5); // Outputs 5",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"function functionWithArgs(a, b) {\n  console.log(a + b);\n}\nfunctionWithArgs(10, 5);"
			],
			"tests": [
				"assert(typeof functionWithArgs === 'function', 'message: <code>functionWithArgs</code> should be a function');",
				"if(typeof functionWithArgs === \"function\") { capture(); functionWithArgs(1,2); uncapture(); } assert(logOutput == 3, 'message: <code>functionWithArgs(1,2)</code> should output <code>3</code>');",
				"if(typeof functionWithArgs === \"function\") { capture(); functionWithArgs(7,9); uncapture(); } assert(logOutput == 16, 'message: <code>functionWithArgs(7,9)</code> should output <code>16</code>');",
				"assert(/^\\s*functionWithArgs\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*\\)\\s*;/m.test(code), 'message: Call <code>functionWithArgs</code> with two numbers after you define it.');"
			]
		},
		"functionArguments": C.En(0)
	},
	"globalScope": {
		"$meta": {
			"name": "Global Scope and Functions",
			"icon": "code",
			"description": [
				"In JavaScript, <dfn>scope</dfn> refers to the visibility of variables. Variables which are defined outside of a function block have <dfn>Global</dfn> scope. This means, they can be seen everywhere in your JavaScript code.",
				"Variables which are used without the <code>var</code> keyword are automatically created in the <code>global</code> scope. This can create unintended consequences elsewhere in your code or when running a function again. You should always declare your variables with <code>var</code>.",
				"<hr>",
				"Using <code>var</code>, declare a <code>global</code> variable <code>myGlobal</code> outside of any function. Initialize it with a value of <code>10</code>.",
				"Inside function <code>fun1</code>, assign <code>5</code> to <code>oopsGlobal</code> <strong><em>without</em></strong> using the <code>var</code> keyword."
			],
			"code": [
				"// Declare your variable here",
				"",
				"",
				"function fun1() {",
				"  // Assign 5 to oopsGlobal Here",
				"  ",
				"}",
				"",
				"// Only change code above this line",
				"function fun2() {",
				"  var output = \"\";",
				"  if (typeof myGlobal != \"undefined\") {",
				"    output += \"myGlobal: \" + myGlobal;",
				"  }",
				"  if (typeof oopsGlobal != \"undefined\") {",
				"    output += \" oopsGlobal: \" + oopsGlobal;",
				"  }",
				"  console.log(output);",
				"}"
			],
			"solutions": [
				"// Declare your variable here\nvar myGlobal = 10;\n\nfunction fun1() {\n  // Assign 5 to oopsGlobal Here\n  oopsGlobal = 5;\n}\n\n// Only change code above this line\nfunction fun2() {\n  var output = \"\";\n  if(typeof myGlobal != \"undefined\") {\n    output += \"myGlobal: \" + myGlobal;\n  }\n  if(typeof oopsGlobal != \"undefined\") {\n    output += \" oopsGlobal: \" + oopsGlobal;\n  }\n  console.log(output);\n}"
			],
			"tests": [
				"assert(typeof myGlobal != \"undefined\", 'message: <code>myGlobal</code> should be defined');",
				"assert(myGlobal === 10, 'message: <code>myGlobal</code> should have a value of <code>10</code>');",
				"assert(/var\\s+myGlobal/.test(code), 'message: <code>myGlobal</code> should be declared using the <code>var</code> keyword');",
				"assert(typeof oopsGlobal != \"undefined\" && oopsGlobal === 5, 'message: <code>oopsGlobal</code> should have a value of <code>5</code>');",
				"assert(!/var\\s+oopsGlobal/.test(code), 'message: Do not declare <code>oopsGlobal</code> using the <code>var</code> keyword');"
			]
		},
		"globalScope": C.En(0)
	},
	"localScope": {
		"$meta": {
			"name": "Local Scope and Functions",
			"icon": "code",
			"description": [
				"Variables which are declared within a function, as well as the function parameters have <dfn>local</dfn> scope. That means, they are only visible within that function.",
				"Here is a function <code>myTest</code> with a local variable called <code>loc</code>.",
				"<blockquote>function myTest() {<br>  var loc = \"foo\";<br>  console.log(loc);<br>}<br>myTest(); // logs \"foo\"<br>console.log(loc); // loc is not defined</blockquote>",
				"<code>loc</code> is not defined outside of the function.",
				"<hr>",
				"Declare a local variable <code>myVar</code> inside <code>myLocalScope</code>. Run the tests and then follow the instructions commented out in the editor.",
				"<strong>Hint</strong><br>Refreshing the page may help if you get stuck."
			],
			"code": [
				"function myLocalScope() {",
				"  'use strict'; // you shouldn't need to edit this line",
				"  ",
				"  console.log(myVar);",
				"}",
				"myLocalScope();",
				"",
				"// Run and check the console",
				"// myVar is not defined outside of myLocalScope",
				"console.log(myVar);",
				"",
				"// Now remove the console log line to pass the test",
				""
			],
			"solutions": [
				"function myLocalScope() {\n  'use strict';\n  \n  var myVar;\n  console.log(myVar);\n}\nmyLocalScope();"
			],
			"tests": [
				"assert(typeof myVar === 'undefined', 'message: No global <code>myVar</code> variable');",
				"assert(/var\\s+myVar/.test(code), 'message: Add a local <code>myVar</code> variable');"
			]
		},
		"localScope": C.En(0)
	},
	"globalVsLocal": {
		"$meta": {
			"name": "Global vs. Local Scope in Functions",
			"icon": "code",
			"description": [
				"It is possible to have both <dfn>local</dfn> and <dfn>global</dfn> variables with the same name. When you do this, the <code>local</code> variable takes precedence over the <code>global</code> variable.",
				"In this example:",
				"<blockquote>var someVar = \"Hat\";<br>function myFun() {<br>  var someVar = \"Head\";<br>  return someVar;<br>}</blockquote>",
				"The function <code>myFun</code> will return <code>\"Head\"</code> because the <code>local</code> version of the variable is present.",
				"<hr>",
				"Add a local variable to <code>myOutfit</code> to override the value of <code>outerWear</code> with <code>\"sweater\"</code>."
			],
			"code": [
				"// Setup",
				"var outerWear = \"T-Shirt\";",
				"",
				"function myOutfit() {",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  ",
				"  // Only change code above this line",
				"  return outerWear;",
				"}",
				"",
				"myOutfit();"
			],
			"solutions": [
				"var outerWear = \"T-Shirt\";\nfunction myOutfit() {\n  var outerWear = \"sweater\";\n  return outerWear;\n}"
			],
			"tests": [
				"assert(outerWear === \"T-Shirt\", 'message: Do not change the value of the global <code>outerWear</code>');",
				"assert(myOutfit() === \"sweater\", 'message: <code>myOutfit</code> should return <code>\"sweater\"</code>');",
				"assert(/return outerWear/.test(code), 'message: Do not change the return statement');"
			]
		},
		"globalVsLocal": C.En(0)
	},
	"returnValue": {
		"$meta": {
			"name": "Return a Value from a Function with Return",
			"icon": "code",
			"description": [
				"We can pass values into a function with <dfn>arguments</dfn>. You can use a <code>return</code> statement to send a value back out of a function.",
				"<strong>Example</strong>",
				"<blockquote>function plusThree(num) {<br>  return num + 3;<br>}<br>var answer = plusThree(5); // 8</blockquote>",
				"<code>plusThree</code> takes an <dfn>argument</dfn> for <code>num</code> and returns a value equal to <code>num + 3</code>.",
				"<hr>",
				"Create a function <code>timesFive</code> that accepts one argument, multiplies it by <code>5</code>, and returns the new value. See the last line in the editor for an example of how you can test your <code>timesFive</code> function."
			],
			"code": [
				"// Example",
				"function minusSeven(num) {",
				"  return num - 7;",
				"}",
				"",
				"// Only change code below this line",
				"",
				"",
				"",
				"console.log(minusSeven(10));"
			],
			"solutions": [
				"function timesFive(num) {\n  return num * 5;\n}"
			],
			"tests": [
				"assert(typeof timesFive === 'function', 'message: <code>timesFive</code> should be a function');",
				"assert(timesFive(5) === 25, 'message: <code>timesFive(5)</code> should return <code>25</code>');",
				"assert(timesFive(2) === 10, 'message: <code>timesFive(2)</code> should return <code>10</code>');",
				"assert(timesFive(0) === 0, 'message: <code>timesFive(0)</code> should return <code>0</code>');"
			]
		},
		"returnValue": C.En(0)
	},
	"assignmentReturnedValue": {
		"$meta": {
			"name": "Assignment with a Returned Value",
			"icon": "code",
			"description": [
				"If you'll recall from our discussion of <a href=\"storing-values-with-the-assignment-operator\" target=\"_blank\">Storing Values with the Assignment Operator</a>, everything to the right of the equal sign is resolved before the value is assigned. This means we can take the return value of a function and assign it to a variable.",
				"Assume we have pre-defined a function <code>sum</code> which adds two numbers together, then: ",
				"<code>ourSum = sum(5, 12);</code>",
				"will call <code>sum</code> function, which returns a value of <code>17</code> and assigns it to <code>ourSum</code> variable.",
				"<hr>",
				"Call the <code>processArg</code> function with an argument of <code>7</code> and assign its return value to the variable <code>processed</code>."
			],
			"code": [
				"// Example",
				"var changed = 0;",
				"",
				"function change(num) {",
				"  return (num + 5) / 3;",
				"}",
				"",
				"changed = change(10);",
				"",
				"// Setup",
				"var processed = 0;",
				"",
				"function processArg(num) {",
				"  return (num + 3) / 5;",
				"}",
				"",
				"// Only change code below this line",
				"",
				""
			],
			"solutions": [
				"var processed = 0;\n\nfunction processArg(num) {\n  return (num + 3) / 5;\n}\n\nprocessed = processArg(7);"
			],
			"tests": [
				"assert(processed === 2, 'message: <code>processed</code> should have a value of <code>2</code>');",
				"assert(/processed\\s*=\\s*processArg\\(\\s*7\\s*\\)\\s*;/.test(code), 'message: You should assign <code>processArg</code> to <code>processed</code>');"
			]
		},
		"assignmentReturnedValue": C.En(0)
	},
	"standInLine": {
		"$meta": {
			"name": "Stand in Line",
			"icon": "code",
			"description": [
				"In Computer Science a <dfn>queue</dfn> is an abstract <dfn>Data Structure</dfn> where items are kept in order. New items can be added at the back of the <code>queue</code> and old items are taken off from the front of the <code>queue</code>.",
				"Write a function <code>nextInLine</code> which takes an array (<code>arr</code>) and a number (<code>item</code>) as arguments.",
				"Add the number to the end of the array, then remove the first element of the array.",
				"The <code>nextInLine</code> function should then return the element that was removed."
			],
			"code": [
				"function nextInLine(arr, item) {",
				"  // Your code here",
				"  ",
				"  return item;  // Change this line",
				"}",
				"",
				"// Test Setup",
				"var testArr = [1,2,3,4,5];",
				"",
				"// Display Code",
				"console.log(\"Before: \" + JSON.stringify(testArr));",
				"console.log(nextInLine(testArr, 6)); // Modify this line to test",
				"console.log(\"After: \" + JSON.stringify(testArr));"
			],
			"solutions": [
				"var testArr = [ 1,2,3,4,5];\n\nfunction nextInLine(arr, item) {\n    arr.push(item);\n    return arr.shift();\n}"
			],
			"tests": [
				"assert.isNumber(nextInLine([],5), 'message: <code>nextInLine([], 5)</code> should return a number.');",
				"assert(nextInLine([],1) === 1, 'message: <code>nextInLine([], 1)</code> should return <code>1</code>');",
				"assert(nextInLine([2],1) === 2, 'message: <code>nextInLine([2], 1)</code> should return <code>2</code>');",
				"assert(nextInLine([5,6,7,8,9],1) === 5, 'message: <code>nextInLine([5,6,7,8,9], 1)</code> should return <code>5</code>');",
				"nextInLine(testArr, 10); assert(testArr[4] === 10, 'message: After <code>nextInLine(testArr, 10)</code>, <code>testArr[4]</code> should be <code>10</code>');"
			]
		},
		"standInLine": C.En(0)
	},
	"booleans": {
		"$meta": {
			"name": "Understanding Boolean Values",
			"icon": "code",
			"description": [
				"Another data type is the <dfn>Boolean</dfn>. <code>Booleans</code> may only be one of two values: <code>true</code> or <code>false</code>. They are basically little on-off switches, where <code>true</code> is \"on\" and <code>false</code> is \"off.\"  These two states are mutually exclusive.",
				"<strong>Note</strong><br><code>Boolean</code> values are never written with quotes. The <code>strings</code> <code>\"true\"</code> and <code>\"false\"</code> are not <code>Boolean</code> and have no special meaning in JavaScript.",
				"<hr>",
				"Modify the <code>welcomeToBooleans</code> function so that it returns <code>true</code> instead of <code>false</code> when the run button is clicked."
			],
			"code": [
				"function welcomeToBooleans() {",
				"",
				"// Only change code below this line.",
				"",
				"return false; // Change this line",
				"",
				"// Only change code above this line.",
				"}"
			],
			"solutions": [
				"function welcomeToBooleans() {\n  return true; // Change this line\n}"
			],
			"tests": [
				"assert(typeof welcomeToBooleans() === 'boolean', 'message: The <code>welcomeToBooleans()</code> function should return a boolean &#40;true/false&#41; value.');",
				"assert(welcomeToBooleans() === true, 'message: <code>welcomeToBooleans()</code> should return true.');"
			]
		},
		"booleans": C.En(0)
	},
	"ifStatement": {
		"$meta": {
			"name": "Use Conditional Logic with If Statements",
			"icon": "code",
			"description": [
				"<code>If</code> statements are used to make decisions in code. The keyword <code>if</code> tells JavaScript to execute the code in the curly braces under certain conditions, defined in the parentheses. These conditions are known as <code>Boolean</code> conditions and they may only be <code>true</code> or <code>false</code>.",
				"When the condition evaluates to <code>true</code>, the program executes the statement inside the curly braces. When the Boolean condition evaluates to <code>false</code>, the statement inside the curly braces will not execute.",
				"<strong>Pseudocode</strong>",
				"<blockquote>if (<i>condition is true</i>) {<br>  <i>statement is executed</i><br>}</blockquote>",
				"<strong>Example</strong>",
				"<blockquote>function test (myCondition) {<br>  if (myCondition) {<br>     return \"It was true\";<br>  }<br>  return \"It was false\";<br>}<br>test(true);  // returns \"It was true\"<br>test(false); // returns \"It was false\"</blockquote>",
				"When <code>test</code> is called with a value of <code>true</code>, the <code>if</code> statement evaluates <code>myCondition</code> to see if it is <code>true</code> or not. Since it is <code>true</code>, the function returns <code>\"It was true\"</code>. When we call <code>test</code> with a value of <code>false</code>, <code>myCondition</code> is <em>not</em> <code>true</code> and the statement in the curly braces is not executed and the function returns <code>\"It was false\"</code>.",
				"<hr>",
				"Create an <code>if</code> statement inside the function to return <code>\"Yes, that was true\"</code> if the parameter <code>wasThatTrue</code> is <code>true</code> and return <code>\"No, that was false\"</code> otherwise."
			],
			"code": [
				"// Example",
				"function ourTrueOrFalse(isItTrue) {",
				"  if (isItTrue) { ",
				"    return \"Yes, it's true\";",
				"  }",
				"  return \"No, it's false\";",
				"}",
				"",
				"// Setup",
				"function trueOrFalse(wasThatTrue) {",
				"",
				"  // Only change code below this line.",
				"  ",
				"  ",
				"  ",
				"  // Only change code above this line.",
				"",
				"}",
				"",
				"// Change this value to test",
				"trueOrFalse(true);"
			],
			"solutions": [
				"function trueOrFalse(wasThatTrue) {\n  if (wasThatTrue) {\n    return \"Yes, that was true\";\n  }\n  return \"No, that was false\";\n}"
			],
			"tests": [
				"assert(typeof trueOrFalse === \"function\", 'message: <code>trueOrFalse</code> should be a function');",
				"assert(typeof trueOrFalse(true) === \"string\", 'message: <code>trueOrFalse(true)</code> should return a string');",
				"assert(typeof trueOrFalse(false) === \"string\", 'message: <code>trueOrFalse(false)</code> should return a string');",
				"assert(trueOrFalse(true) === \"Yes, that was true\", 'message: <code>trueOrFalse(true)</code> should return \"Yes, that was true\"');",
				"assert(trueOrFalse(false) === \"No, that was false\", 'message: <code>trueOrFalse(false)</code> should return \"No, that was false\"');"
			]
		},
		"ifStatement": C.En(0)
	},
	"comparison": {
		"$meta": {
			"name": "Comparison with the Equality Operator",
			"icon": "code",
			"description": [
				"There are many <dfn>Comparison Operators</dfn> in JavaScript. All of these operators return a boolean <code>true</code> or <code>false</code> value.",
				"The most basic operator is the equality operator <code>==</code>. The equality operator compares two values and returns <code>true</code> if they're equivalent or <code>false</code> if they are not. Note that equality is different from assignment (<code>=</code>), which assigns the value at the right of the operator to a variable in the left.",
				"<blockquote>function equalityTest(myVal) {<br>  if (myVal == 10) {<br>     return \"Equal\";<br>  }<br>  return \"Not Equal\";<br>}</blockquote>",
				"If <code>myVal</code> is equal to <code>10</code>, the equality operator returns <code>true</code>, so the code in the curly braces will execute, and the function will return <code>\"Equal\"</code>. Otherwise, the function will return <code>\"Not Equal\"</code>.",
				"In order for JavaScript to compare two different <code>data types</code> (for example, <code>numbers</code> and <code>strings</code>), it must convert one type to another. Once it does, however, it can compare terms as follows:",
				"<blockquote>   1   ==  1    // true<br>   1   ==  2    // false<br>   1   == '1'   // true<br>  \"3\"  ==  3    // true</blockquote>",
				"<hr>",
				"Add the <code>equality operator</code> to the indicated line so that the function will return \"Equal\" when <code>val</code> is equivalent to <code>12</code>"
			],
			"code": [
				"// Setup",
				"function testEqual(val) {",
				"  if (val) { // Change this line",
				"    return \"Equal\";",
				"  }",
				"  return \"Not Equal\";",
				"}",
				"",
				"// Change this value to test",
				"testEqual(10);"
			],
			"solutions": [
				"function testEqual(val) {\n  if (val == 12) {\n    return \"Equal\";\n  }\n  return \"Not Equal\";\n}"
			],
			"tests": [
				"assert(testEqual(10) === \"Not Equal\", 'message: <code>testEqual(10)</code> should return \"Not Equal\"');",
				"assert(testEqual(12) === \"Equal\", 'message: <code>testEqual(12)</code> should return \"Equal\"');",
				"assert(testEqual(\"12\") === \"Equal\", 'message: <code>testEqual(\"12\")</code> should return \"Equal\"');",
				"assert(code.match(/==/g) && !code.match(/===/g), 'message: You should use the <code>==</code> operator');"
			]
		},
		"comparison": C.En(0)
	},
	"strictComparison": {
		"$meta": {
			"name": "Comparison with the Strict Equality Operator",
			"icon": "code",
			"description": [
				"Strict equality (<code>===</code>) is the counterpart to the equality operator (<code>==</code>). Unlike the equality operator, strict equality tests both the <code>data type</code> and value of the compared elements.",
				"<strong>Examples</strong>",
				"<blockquote>3 === 3   // true<br>3 === '3' // false</blockquote>",
				"In the second example, <code>3</code> is a <code>Number</code> type and <code>'3'</code> is a <code>String</code> type.",
				"<hr>",
				"Use the strict equality operator in the <code>if</code> statement so the function will return \"Equal\" when <code>val</code> is strictly equal to <code>7</code>"
			],
			"code": [
				"// Setup",
				"function testStrict(val) {",
				"  if (val) { // Change this line",
				"    return \"Equal\";",
				"  }",
				"  return \"Not Equal\";",
				"}",
				"",
				"// Change this value to test",
				"testStrict(10);"
			],
			"solutions": [
				"function testStrict(val) {\n  if (val === 7) {\n    return \"Equal\";\n  }\n  return \"Not Equal\";\n}"
			],
			"tests": [
				"assert(testStrict(10) === \"Not Equal\", 'message: <code>testStrict(10)</code> should return \"Not Equal\"');",
				"assert(testStrict(7) === \"Equal\", 'message: <code>testStrict(7)</code> should return \"Equal\"');",
				"assert(testStrict(\"7\") === \"Not Equal\", 'message: <code>testStrict(\"7\")</code> should return \"Not Equal\"');",
				"assert(code.match(/(val\\s*===\\s*\\d+)|(\\d+\\s*===\\s*val)/g).length > 0, 'message: You should use the <code>===</code> operator');"
			]
		},
		"strictComparison": C.En(0)
	},
	"comparisonInequeality": {
		"$meta": {
			"name": "Comparison with the Inequality Operator",
			"icon": "code",
			"description": [
				"The inequality operator (<code>!=</code>) is the opposite of the equality operator. It means \"Not Equal\" and returns <code>false</code> where equality would return <code>true</code> and <em>vice versa</em>. Like the equality operator, the inequality operator will convert data types of values while comparing.",
				"<strong>Examples</strong>",
				"<blockquote>1 != 2      // true<br>1 != \"1\"    // false<br>1 != '1'    // false<br>1 != true   // false<br>0 != false  // false</blockquote>",
				"<hr>",
				"Add the inequality operator <code>!=</code> in the <code>if</code> statement so that the function will return \"Not Equal\" when <code>val</code> is not equivalent to <code>99</code>"
			],
			"code": [
				"// Setup",
				"function testNotEqual(val) {",
				"  if (val) { // Change this line",
				"    return \"Not Equal\";",
				"  }",
				"  return \"Equal\";",
				"}",
				"",
				"// Change this value to test",
				"testNotEqual(10);"
			],
			"solutions": [
				"function testNotEqual(val) {\n  if (val != 99) {\n    return \"Not Equal\";\n  }\n  return \"Equal\";\n}"
			],
			"tests": [
				"assert(testNotEqual(99) === \"Equal\", 'message: <code>testNotEqual(99)</code> should return \"Equal\"');",
				"assert(testNotEqual(\"99\") === \"Equal\", 'message: <code>testNotEqual(\"99\")</code> should return \"Equal\"');",
				"assert(testNotEqual(12) === \"Not Equal\", 'message: <code>testNotEqual(12)</code> should return \"Not Equal\"');",
				"assert(testNotEqual(\"12\") === \"Not Equal\", 'message: <code>testNotEqual(\"12\")</code> should return \"Not Equal\"');",
				"assert(testNotEqual(\"bob\") === \"Not Equal\", 'message: <code>testNotEqual(\"bob\")</code> should return \"Not Equal\"');",
				"assert(code.match(/(?!!==)!=/), 'message: You should use the <code>!=</code> operator');"
			]
		},
		"comparisonInequeality": C.En(0)
	},
	"comparisonStrictInequeality": {
		"$meta": {
			"name": "Comparison with the Strict Inequality Operator",
			"icon": "code",
			"description": [
				"The strict inequality operator (<code>!==</code>) is the logical opposite of the strict equality operator. It means \"Strictly Not Equal\" and returns <code>false</code> where strict equality would return <code>true</code> and <em>vice versa</em>. Strict inequality will not convert data types.",
				"<strong>Examples</strong>",
				"<blockquote>3 !== 3   // false<br>3 !== '3' // true<br>4 !== 3   // true</blockquote>",
				"<hr>",
				"Add the <code>strict inequality operator</code> to the <code>if</code> statement so the function will return \"Not Equal\" when <code>val</code> is not strictly equal to <code>17</code>"
			],
			"code": [
				"// Setup",
				"function testStrictNotEqual(val) {",
				"  // Only Change Code Below this Line",
				"  ",
				"  if (val) {",
				"",
				"  // Only Change Code Above this Line",
				"",
				"    return \"Not Equal\";",
				"  }",
				"  return \"Equal\";",
				"}",
				"",
				"// Change this value to test",
				"testStrictNotEqual(10);"
			],
			"solutions": [
				"function testStrictNotEqual(val) {\n  if (val !== 17) {\n    return \"Not Equal\";\n  }\n  return \"Equal\";\n}"
			],
			"tests": [
				"assert(testStrictNotEqual(17) === \"Equal\", 'message: <code>testStrictNotEqual(17)</code> should return \"Equal\"');",
				"assert(testStrictNotEqual(\"17\") === \"Not Equal\", 'message: <code>testStrictNotEqual(\"17\")</code> should return \"Not Equal\"');",
				"assert(testStrictNotEqual(12) === \"Not Equal\", 'message: <code>testStrictNotEqual(12)</code> should return \"Not Equal\"');",
				"assert(testStrictNotEqual(\"bob\") === \"Not Equal\", 'message: <code>testStrictNotEqual(\"bob\")</code> should return \"Not Equal\"');",
				"assert(code.match(/(val\\s*!==\\s*\\d+)|(\\d+\\s*!==\\s*val)/g).length > 0, 'message: You should use the <code>!==</code> operator');"
			]
		},
		"comparisonStrictInequeality": C.En(0)
	},
	"greaterThan": {
		"$meta": {
			"name": "Comparison with the Greater Than Operator",
			"icon": "code",
			"description": [
				"The greater than operator (<code>&gt;</code>) compares the values of two numbers. If the number to the left is greater than the number to the right, it returns <code>true</code>. Otherwise, it returns <code>false</code>.",
				"Like the equality operator, greater than operator will convert data types of values while comparing.",
				"<strong>Examples</strong>",
				"<blockquote> 5 > 3   // true<br> 7 > '3' // true<br> 2 > 3   // false<br>'1' > 9  // false</blockquote>",
				"<hr>",
				"Add the <code>greater than</code> operator to the indicated lines so that the return statements make sense."
			],
			"code": [
				"function testGreaterThan(val) {",
				"  if (val) {  // Change this line",
				"    return \"Over 100\";",
				"  }",
				"  ",
				"  if (val) {  // Change this line",
				"    return \"Over 10\";",
				"  }",
				"",
				"  return \"10 or Under\";",
				"}",
				"",
				"// Change this value to test",
				"testGreaterThan(10);"
			],
			"solutions": [
				"function testGreaterThan(val) {\n  if (val > 100) {  // Change this line\n    return \"Over 100\";\n  }\n  if (val > 10) {  // Change this line\n    return \"Over 10\";\n  }\n  return \"10 or Under\";\n}"
			],
			"tests": [
				"assert(testGreaterThan(0) === \"10 or Under\", 'message: <code>testGreaterThan(0)</code> should return \"10 or Under\"');",
				"assert(testGreaterThan(10) === \"10 or Under\", 'message: <code>testGreaterThan(10)</code> should return \"10 or Under\"');",
				"assert(testGreaterThan(11) === \"Over 10\", 'message: <code>testGreaterThan(11)</code> should return \"Over 10\"');",
				"assert(testGreaterThan(99) === \"Over 10\", 'message: <code>testGreaterThan(99)</code> should return \"Over 10\"');",
				"assert(testGreaterThan(100) === \"Over 10\", 'message: <code>testGreaterThan(100)</code> should return \"Over 10\"');",
				"assert(testGreaterThan(101) === \"Over 100\", 'message: <code>testGreaterThan(101)</code> should return \"Over 100\"');",
				"assert(testGreaterThan(150) === \"Over 100\", 'message: <code>testGreaterThan(150)</code> should return \"Over 100\"');",
				"assert(code.match(/val\\s*>\\s*('|\")*\\d+('|\")*/g).length > 1, 'message: You should use the <code>&gt;</code> operator at least twice');"
			]
		},
		"greaterThan": C.En(0)
	},
	"greaterTharOr": {
		"$meta": {
			"name": "Comparison with the Greater Than Or Equal To Operator",
			"icon": "code",
			"description": [
				"The <code>greater than or equal to</code> operator (<code>&gt;=</code>) compares the values of two numbers. If the number to the left is greater than or equal to the number to the right, it returns <code>true</code>. Otherwise, it returns <code>false</code>.",
				"Like the equality operator, <code>greater than or equal to</code> operator will convert data types while comparing.",
				"<strong>Examples</strong>",
				"<blockquote> 6  >=  6  // true<br> 7  >= '3' // true<br> 2  >=  3  // false<br>'7' >=  9  // false</blockquote>",
				"<hr>",
				"Add the <code>greater than or equal to</code> operator to the indicated lines so that the return statements make sense."
			],
			"code": [
				"function testGreaterOrEqual(val) {",
				"  if (val) {  // Change this line",
				"    return \"20 or Over\";",
				"  }",
				"  ",
				"  if (val) {  // Change this line",
				"    return \"10 or Over\";",
				"  }",
				"",
				"  return \"Less than 10\";",
				"}",
				"",
				"// Change this value to test",
				"testGreaterOrEqual(10);"
			],
			"solutions": [
				"function testGreaterOrEqual(val) {\n  if (val >= 20) {  // Change this line\n    return \"20 or Over\";\n  }\n  \n  if (val >= 10) {  // Change this line\n    return \"10 or Over\";\n  }\n\n  return \"Less than 10\";\n}"
			],
			"tests": [
				"assert(testGreaterOrEqual(0) === \"Less than 10\", 'message: <code>testGreaterOrEqual(0)</code> should return \"Less than 10\"');",
				"assert(testGreaterOrEqual(9) === \"Less than 10\", 'message: <code>testGreaterOrEqual(9)</code> should return \"Less than 10\"');",
				"assert(testGreaterOrEqual(10) === \"10 or Over\", 'message: <code>testGreaterOrEqual(10)</code> should return \"10 or Over\"');",
				"assert(testGreaterOrEqual(11) === \"10 or Over\", 'message: <code>testGreaterOrEqual(11)</code> should return \"10 or Over\"');",
				"assert(testGreaterOrEqual(19) === \"10 or Over\", 'message: <code>testGreaterOrEqual(19)</code> should return \"10 or Over\"');",
				"assert(testGreaterOrEqual(100) === \"20 or Over\", 'message: <code>testGreaterOrEqual(100)</code> should return \"20 or Over\"');",
				"assert(testGreaterOrEqual(21) === \"20 or Over\", 'message: <code>testGreaterOrEqual(21)</code> should return \"20 or Over\"');",
				"assert(code.match(/val\\s*>=\\s*('|\")*\\d+('|\")*/g).length > 1, 'message: You should use the <code>&gt;=</code> operator at least twice');"
			]
		},
		"greaterTharOr": C.En(0)
	},
	"lessThan": {
		"$meta": {
			"name": "Comparison with the Less Than Operator",
			"icon": "code",
			"description": [
				"The <dfn>less than</dfn> operator (<code>&lt;</code>) compares the values of two numbers. If the number to the left is less than the number to the right, it returns <code>true</code>. Otherwise, it returns <code>false</code>. Like the equality operator, <dfn>less than</dfn> operator converts data types while comparing.",
				"<strong>Examples</strong>",
				"<blockquote>  2 &lt; 5  // true<br>'3' &lt; 7  // true<br>  5 &lt; 5  // false<br>  3 &lt; 2  // false<br>'8' &lt; 4  // false</blockquote>",
				"<hr>",
				"Add the <code>less than</code> operator to the indicated lines so that the return statements make sense."
			],
			"code": [
				"function testLessThan(val) {",
				"  if (val) {  // Change this line",
				"    return \"Under 25\";",
				"  }",
				"  ",
				"  if (val) {  // Change this line",
				"    return \"Under 55\";",
				"  }",
				"",
				"  return \"55 or Over\";",
				"}",
				"",
				"// Change this value to test",
				"testLessThan(10);"
			],
			"solutions": [
				"function testLessThan(val) {\n  if (val < 25) {  // Change this line\n    return \"Under 25\";\n  }\n  \n  if (val < 55) {  // Change this line\n    return \"Under 55\";\n  }\n\n  return \"55 or Over\";\n}"
			],
			"tests": [
				"assert(testLessThan(0) === \"Under 25\", 'message: <code>testLessThan(0)</code> should return \"Under 25\"');",
				"assert(testLessThan(24) === \"Under 25\", 'message: <code>testLessThan(24)</code> should return \"Under 25\"');",
				"assert(testLessThan(25) === \"Under 55\", 'message: <code>testLessThan(25)</code> should return \"Under 55\"');",
				"assert(testLessThan(54) === \"Under 55\", 'message: <code>testLessThan(54)</code> should return \"Under 55\"');",
				"assert(testLessThan(55) === \"55 or Over\", 'message: <code>testLessThan(55)</code> should return \"55 or Over\"');",
				"assert(testLessThan(99) === \"55 or Over\", 'message: <code>testLessThan(99)</code> should return \"55 or Over\"');",
				"assert(code.match(/val\\s*<\\s*('|\")*\\d+('|\")*/g).length > 1, 'message: You should use the <code>&lt;</code> operator at least twice');"
			]
		},
		"lessThan": C.En(0)
	},
	"lessThanOr": {
		"$meta": {
			"name": "Comparison with the Less Than Or Equal To Operator",
			"icon": "code",
			"description": [
				"The <code>less than or equal to</code> operator (<code>&lt;=</code>) compares the values of two numbers. If the number to the left is less than or equal the number to the right, it returns <code>true</code>. If the number on the left is greater than the number on the right, it returns <code>false</code>. Like the equality operator, <code>less than or equal to</code> converts data types.",
				"<strong>Examples</strong>",
				"<blockquote>  4 &lt;= 5  // true<br>'7' &lt;= 7  // true<br>  5 &lt;= 5  // true<br>  3 &lt;= 2  // false<br>'8' &lt;= 4  // false</blockquote>",
				"<hr>",
				"Add the <code>less than or equal to</code> operator to the indicated lines so that the return statements make sense."
			],
			"code": [
				"function testLessOrEqual(val) {",
				"  if (val) {  // Change this line",
				"    return \"Smaller Than or Equal to 12\";",
				"  }",
				"  ",
				"  if (val) {  // Change this line",
				"    return \"Smaller Than or Equal to 24\";",
				"  }",
				"",
				"  return \"More Than 24\";",
				"}",
				"",
				"// Change this value to test",
				"testLessOrEqual(10);",
				""
			],
			"solutions": [
				"function testLessOrEqual(val) {\n  if (val <= 12) {  // Change this line\n    return \"Smaller Than or Equal to 12\";\n  }\n  \n  if (val <= 24) {  // Change this line\n    return \"Smaller Than or Equal to 24\";\n  }\n\n  return \"More Than 24\";\n}"
			],
			"tests": [
				"assert(testLessOrEqual(0) === \"Smaller Than or Equal to 12\", 'message: <code>testLessOrEqual(0)</code> should return \"Smaller Than or Equal to 12\"');",
				"assert(testLessOrEqual(11) === \"Smaller Than or Equal to 12\", 'message: <code>testLessOrEqual(11)</code> should return \"Smaller Than or Equal to 12\"');",
				"assert(testLessOrEqual(12) === \"Smaller Than or Equal to 12\", 'message: <code>testLessOrEqual(12)</code> should return \"Smaller Than or Equal to 12\"');",
				"assert(testLessOrEqual(23) === \"Smaller Than or Equal to 24\", 'message: <code>testLessOrEqual(23)</code> should return \"Smaller Than or Equal to 24\"');",
				"assert(testLessOrEqual(24) === \"Smaller Than or Equal to 24\", 'message: <code>testLessOrEqual(24)</code> should return \"Smaller Than or Equal to 24\"');",
				"assert(testLessOrEqual(25) === \"More Than 24\", 'message: <code>testLessOrEqual(25)</code> should return \"More Than 24\"');",
				"assert(testLessOrEqual(55) === \"More Than 24\", 'message: <code>testLessOrEqual(55)</code> should return \"More Than 24\"');",
				"assert(code.match(/val\\s*<=\\s*('|\")*\\d+('|\")*/g).length > 1, 'message: You should use the <code>&lt;=</code> operator at least twice');"
			]
		},
		"lessThanOr": C.En(0)
	},
	"logicalAnd": {
		"$meta": {
			"name": "Comparisons with the Logical And Operator",
			"icon": "code",
			"description": [
				"Sometimes you will need to test more than one thing at a time. The <dfn>logical and</dfn> operator (<code>&&</code>) returns <code>true</code> if and only if the <dfn>operands</dfn> to the left and right of it are true.",
				"The same effect could be achieved by nesting an if statement inside another if:",
				"<blockquote>if (num > 5) {<br>  if (num < 10) {<br>    return \"Yes\";<br>  }<br>}<br>return \"No\";</blockquote>",
				"will only return \"Yes\" if <code>num</code> is greater than <code>5</code> and less than <code>10</code>. The same logic can be written as:",
				"<blockquote>if (num > 5 && num < 10) {<br>  return \"Yes\";<br>}<br>return \"No\";</blockquote>",
				"<hr>",
				"Combine the two if statements into one statement which will return <code>\"Yes\"</code> if <code>val</code> is less than or equal to <code>50</code> and greater than or equal to <code>25</code>. Otherwise, will return <code>\"No\"</code>."
			],
			"code": [
				"function testLogicalAnd(val) {",
				"  // Only change code below this line",
				"",
				"  if (val) {",
				"    if (val) {",
				"      return \"Yes\";",
				"    }",
				"  }",
				"",
				"  // Only change code above this line",
				"  return \"No\";",
				"}",
				"",
				"// Change this value to test",
				"testLogicalAnd(10);"
			],
			"solutions": [
				"function testLogicalAnd(val) {\n  if (val >= 25 && val <= 50) {\n    return \"Yes\";\n  }\n  return \"No\";\n}"
			],
			"tests": [
				"assert(code.match(/&&/g).length === 1, 'message: You should use the <code>&&</code> operator once');",
				"assert(code.match(/if/g).length === 1, 'message: You should only have one <code>if</code> statement');",
				"assert(testLogicalAnd(0) === \"No\", 'message: <code>testLogicalAnd(0)</code> should return \"No\"');",
				"assert(testLogicalAnd(24) === \"No\", 'message: <code>testLogicalAnd(24)</code> should return \"No\"');",
				"assert(testLogicalAnd(25) === \"Yes\", 'message: <code>testLogicalAnd(25)</code> should return \"Yes\"');",
				"assert(testLogicalAnd(30) === \"Yes\", 'message: <code>testLogicalAnd(30)</code> should return \"Yes\"');",
				"assert(testLogicalAnd(50) === \"Yes\", 'message: <code>testLogicalAnd(50)</code> should return \"Yes\"');",
				"assert(testLogicalAnd(51) === \"No\", 'message: <code>testLogicalAnd(51)</code> should return \"No\"');",
				"assert(testLogicalAnd(75) === \"No\", 'message: <code>testLogicalAnd(75)</code> should return \"No\"');",
				"assert(testLogicalAnd(80) === \"No\", 'message: <code>testLogicalAnd(80)</code> should return \"No\"');"
			]
		},
		"logicalAnd": C.En(0)
	},
	"logicalOr": {
		"$meta": {
			"name": "Comparisons with the Logical Or Operator",
			"icon": "code",
			"description": [
				"The <dfn>logical or</dfn> operator (<code>||</code>) returns <code>true</code> if either of the <dfn>operands</dfn> is <code>true</code>. Otherwise, it returns <code>false</code>.",
				"The pattern below should look familiar from prior waypoints:",
				"<blockquote>if (num > 10) {<br>  return \"No\";<br>}<br>if (num < 5) {<br>  return \"No\";<br>}<br>return \"Yes\";</blockquote>",
				"will return \"Yes\" only if <code>num</code> is between <code>5</code> and <code>10</code> (5 and 10 included). The same logic can be written as:",
				"<blockquote>if (num > 10 || num < 5) {<br>  return \"No\";<br>}<br>return \"Yes\";</blockquote>",
				"<hr>",
				"Combine the two <code>if</code> statements into one statement which returns <code>\"Outside\"</code> if <code>val</code> is not between <code>10</code> and <code>20</code>, inclusive. Otherwise, return <code>\"Inside\"</code>."
			],
			"code": [
				"function testLogicalOr(val) {",
				"  // Only change code below this line",
				"",
				"  if (val) {",
				"    return \"Outside\";",
				"  }",
				"",
				"  if (val) {",
				"    return \"Outside\";",
				"  }",
				"",
				"  // Only change code above this line",
				"  return \"Inside\";",
				"}",
				"",
				"// Change this value to test",
				"testLogicalOr(15);"
			],
			"solutions": [
				"function testLogicalOr(val) {\n  if (val < 10 || val > 20) {\n    return \"Outside\";\n  }\n  return \"Inside\";\n}"
			],
			"tests": [
				"assert(code.match(/\\|\\|/g).length === 1, 'message: You should use the <code>||</code> operator once');",
				"assert(code.match(/if/g).length === 1, 'message: You should only have one <code>if</code> statement');",
				"assert(testLogicalOr(0) === \"Outside\", 'message: <code>testLogicalOr(0)</code> should return \"Outside\"');",
				"assert(testLogicalOr(9) === \"Outside\", 'message: <code>testLogicalOr(9)</code> should return \"Outside\"');",
				"assert(testLogicalOr(10) === \"Inside\", 'message: <code>testLogicalOr(10)</code> should return \"Inside\"');",
				"assert(testLogicalOr(15) === \"Inside\", 'message: <code>testLogicalOr(15)</code> should return \"Inside\"');",
				"assert(testLogicalOr(19) === \"Inside\", 'message: <code>testLogicalOr(19)</code> should return \"Inside\"');",
				"assert(testLogicalOr(20) === \"Inside\", 'message: <code>testLogicalOr(20)</code> should return \"Inside\"');",
				"assert(testLogicalOr(21) === \"Outside\", 'message: <code>testLogicalOr(21)</code> should return \"Outside\"');",
				"assert(testLogicalOr(25) === \"Outside\", 'message: <code>testLogicalOr(25)</code> should return \"Outside\"');"
			]
		},
		"logicalOr": C.En(0)
	},
	"elseStatement": {
		"$meta": {
			"name": "Introducing Else Statements",
			"icon": "code",
			"description": [
				"When a condition for an <code>if</code> statement is true, the block of code following it is executed. What about when that condition is false?  Normally nothing would happen. With an <code>else</code> statement, an alternate block of code can be executed.",
				"<blockquote>if (num > 10) {<br>  return \"Bigger than 10\";<br>} else {<br>  return \"10 or Less\";<br>}</blockquote>",
				"<hr>",
				"Combine the <code>if</code> statements into a single <code>if/else</code> statement."
			],
			"code": [
				"function testElse(val) {",
				"  var result = \"\";",
				"  // Only change code below this line",
				"  ",
				"  if (val > 5) {",
				"    result = \"Bigger than 5\";",
				"  }",
				"  ",
				"  if (val <= 5) {",
				"    result = \"5 or Smaller\";",
				"  }",
				"  ",
				"  // Only change code above this line",
				"  return result;",
				"}",
				"",
				"// Change this value to test",
				"testElse(4);",
				""
			],
			"solutions": [
				"function testElse(val) {\n  var result = \"\";\n  if(val > 5) {\n    result = \"Bigger than 5\";\n  } else {\n    result = \"5 or Smaller\";\n  }\n  return result;\n}"
			],
			"tests": [
				"assert(code.match(/if/g).length === 1, 'message: You should only have one <code>if</code> statement in the editor');",
				"assert(/else/g.test(code), 'message: You should use an <code>else</code> statement');",
				"assert(testElse(4) === \"5 or Smaller\", 'message: <code>testElse(4)</code> should return \"5 or Smaller\"');",
				"assert(testElse(5) === \"5 or Smaller\", 'message: <code>testElse(5)</code> should return \"5 or Smaller\"');",
				"assert(testElse(6) === \"Bigger than 5\", 'message: <code>testElse(6)</code> should return \"Bigger than 5\"');",
				"assert(testElse(10) === \"Bigger than 5\", 'message: <code>testElse(10)</code> should return \"Bigger than 5\"');",
				"assert(/var result = \"\";/.test(code) && /return result;/.test(code), 'message: Do not change the code above or below the lines.');"
			]
		},
		"elseStatement": C.En(0)
	},
	"elseIfStatement": {
		"$meta": {
			"name": "Introducing Else If Statements",
			"icon": "code",
			"description": [
				"If you have multiple conditions that need to be addressed, you can chain <code>if</code> statements together with <code>else if</code> statements.",
				"<blockquote>if (num > 15) {<br>  return \"Bigger than 15\";<br>} else if (num < 5) {<br>  return \"Smaller than 5\";<br>} else {<br>  return \"Between 5 and 15\";<br>}</blockquote>",
				"<hr>",
				"Convert the logic to use <code>else if</code> statements."
			],
			"code": [
				"function testElseIf(val) {",
				"  if (val > 10) {",
				"    return \"Greater than 10\";",
				"  }",
				"  ",
				"  if (val < 5) {",
				"    return \"Smaller than 5\";",
				"  }",
				"  ",
				"  return \"Between 5 and 10\";",
				"}",
				"",
				"// Change this value to test",
				"testElseIf(7);",
				""
			],
			"solutions": [
				"function testElseIf(val) {\n  if(val > 10) {\n    return \"Greater than 10\";\n  } else if(val < 5) {\n    return \"Smaller than 5\";\n  } else {\n    return \"Between 5 and 10\";\n  }\n}"
			],
			"tests": [
				"assert(code.match(/else/g).length > 1, 'message: You should have at least two <code>else</code> statements');",
				"assert(code.match(/if/g).length > 1, 'message: You should have at least two <code>if</code> statements');",
				"assert(testElseIf(0) === \"Smaller than 5\", 'message: <code>testElseIf(0)</code> should return \"Smaller than 5\"');",
				"assert(testElseIf(5) === \"Between 5 and 10\", 'message: <code>testElseIf(5)</code> should return \"Between 5 and 10\"');",
				"assert(testElseIf(7) === \"Between 5 and 10\", 'message: <code>testElseIf(7)</code> should return \"Between 5 and 10\"');",
				"assert(testElseIf(10) === \"Between 5 and 10\", 'message: <code>testElseIf(10)</code> should return \"Between 5 and 10\"');",
				"assert(testElseIf(12) === \"Greater than 10\", 'message: <code>testElseIf(12)</code> should return \"Greater than 10\"');"
			]
		},
		"elseIfStatement": C.En(0)
	},
	"ifElseOrder": {
		"$meta": {
			"name": "Logical Order in If Else Statements",
			"icon": "code",
			"description": [
				"Order is important in <code>if</code>, <code>else if</code> statements.",
				"The loop is executed from top to bottom so you will want to be careful of what statement comes first.",
				"Take these two functions as an example.",
				"Here's the first:",
				"<blockquote>function foo(x) {<br>  if (x < 1) {<br>    return \"Less than one\";<br>  } else if (x < 2) {<br>    return \"Less than two\";<br>  } else {<br>    return \"Greater than or equal to two\";<br>  }<br>}</blockquote>",
				"And the second just switches the order of the statements:",
				"<blockquote>function bar(x) {<br>  if (x < 2) {<br>    return \"Less than two\";<br>  } else if (x < 1) {<br>    return \"Less than one\";<br>  } else {<br>    return \"Greater than or equal to two\";<br>  }<br>}</blockquote>",
				"While these two functions look nearly identical if we pass a number to both we get different outputs.",
				"<blockquote>foo(0) // \"Less than one\"<br>bar(0) // \"Less than two\"</blockquote>",
				"<hr>",
				"Change the order of logic in the function so that it will return the correct statements in all cases."
			],
			"code": [
				"function orderMyLogic(val) {",
				"  if (val < 10) {",
				"    return \"Less than 10\";",
				"  } else if (val < 5) {",
				"    return \"Less than 5\";",
				"  } else {",
				"    return \"Greater than or equal to 10\";",
				"  }",
				"}",
				"",
				"// Change this value to test",
				"orderMyLogic(7);"
			],
			"solutions": [
				"function orderMyLogic(val) {\n  if(val < 5) {\n    return \"Less than 5\";            \n  } else if (val < 10) {\n    return \"Less than 10\";\n  } else {\n    return \"Greater than or equal to 10\";\n  }\n}"
			],
			"tests": [
				"assert(orderMyLogic(4) === \"Less than 5\", 'message: <code>orderMyLogic(4)</code> should return \"Less than 5\"');",
				"assert(orderMyLogic(6) === \"Less than 10\", 'message: <code>orderMyLogic(6)</code> should return \"Less than 10\"');",
				"assert(orderMyLogic(11) === \"Greater than or equal to 10\", 'message: <code>orderMyLogic(11)</code> should return \"Greater than or equal to 10\"');"
			]
		},
		"ifElseOrder": C.En(0)
	},
	"chainingIfElse": {
		"$meta": {
			"name": "Chaining If Else Statements",
			"icon": "code",
			"description": [
				"<code>if/else</code> statements can be chained together for complex logic. Here is <dfn>pseudocode</dfn> of multiple chained <code>if</code> / <code>else if</code> statements:",
				"<blockquote>if (<em>condition1</em>) {<br>  <em>statement1</em><br>} else if (<em>condition2</em>) {<br>  <em>statement2</em><br>} else if (<em>condition3</em>) {<br>  <em>statement3</em><br>. . .<br>} else {<br>  <em>statementN</em><br>}</blockquote>",
				"<hr>",
				"Write chained <code>if</code>/<code>else if</code> statements to fulfill the following conditions:",
				"<code>num &lt;   5</code> - return \"Tiny\"<br><code>num &lt;  10</code> - return \"Small\"<br><code>num &lt; 15</code> - return \"Medium\"<br><code>num &lt; 20</code> - return \"Large\"<br><code>num >= 20</code>  - return \"Huge\""
			],
			"code": [
				"function testSize(num) {",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  return \"Change Me\";",
				"  // Only change code above this line",
				"}",
				"",
				"// Change this value to test",
				"testSize(7);"
			],
			"solutions": [
				"function testSize(num) {\n  if (num < 5) {\n    return \"Tiny\";\n  } else if (num < 10) {\n    return \"Small\";\n  } else if (num < 15) {\n    return \"Medium\";\n  } else if (num < 20) {\n    return \"Large\";\n  } else {\n    return \"Huge\";\n  }\n}"
			],
			"tests": [
				"assert(code.match(/else/g).length > 3, 'message: You should have at least four <code>else</code> statements');",
				"assert(code.match(/if/g).length > 3, 'message: You should have at least four <code>if</code> statements');",
				"assert(code.match(/return/g).length >= 1, 'message: You should have at least one <code>return</code> statement');",
				"assert(testSize(0) === \"Tiny\", 'message: <code>testSize(0)</code> should return \"Tiny\"');",
				"assert(testSize(4) === \"Tiny\", 'message: <code>testSize(4)</code> should return \"Tiny\"');",
				"assert(testSize(5) === \"Small\", 'message: <code>testSize(5)</code> should return \"Small\"');",
				"assert(testSize(8) === \"Small\", 'message: <code>testSize(8)</code> should return \"Small\"');",
				"assert(testSize(10) === \"Medium\", 'message: <code>testSize(10)</code> should return \"Medium\"');",
				"assert(testSize(14) === \"Medium\", 'message: <code>testSize(14)</code> should return \"Medium\"');",
				"assert(testSize(15) === \"Large\", 'message: <code>testSize(15)</code> should return \"Large\"');",
				"assert(testSize(17) === \"Large\", 'message: <code>testSize(17)</code> should return \"Large\"');",
				"assert(testSize(20) === \"Huge\", 'message: <code>testSize(20)</code> should return \"Huge\"');",
				"assert(testSize(25) === \"Huge\", 'message: <code>testSize(25)</code> should return \"Huge\"');"
			]
		},
		"chainingIfElse": C.En(0)
	},
	"golfCode": {
		"$meta": {
			"name": "Golf Code",
			"icon": "code",
			"description": [
				"In the game of <a href=\"https://en.wikipedia.org/wiki/Golf\" target=\"_blank\">golf</a> each hole has a <code>par</code> meaning the average number of <code>strokes</code> a golfer is expected to make in order to sink the ball in a hole to complete the play. Depending on how far above or below <code>par</code> your <code>strokes</code> are, there is a different nickname.",
				"Your function will be passed <code>par</code> and <code>strokes</code> arguments. Return the correct string according to this table which lists the strokes in order of priority; top (highest) to bottom (lowest):",
				"<table class=\"table table-striped\"><thead><tr><th>Strokes</th><th>Return</th></tr></thead><tbody><tr><td>1</td><td>\"Hole-in-one!\"</td></tr><tr><td>&lt;= par - 2</td><td>\"Eagle\"</td></tr><tr><td>par - 1</td><td>\"Birdie\"</td></tr><tr><td>par</td><td>\"Par\"</td></tr><tr><td>par + 1</td><td>\"Bogey\"</td></tr><tr><td>par + 2</td><td>\"Double Bogey\"</td></tr><tr><td>&gt;= par + 3</td><td>\"Go Home!\"</td></tr></tbody></table>",
				"<code>par</code> and <code>strokes</code> will always be numeric and positive."
			],
			"code": [
				"function golfScore(par, strokes) {",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  return \"Change Me\";",
				"  // Only change code above this line",
				"}",
				"",
				"// Change these values to test",
				"golfScore(5, 4);"
			],
			"solutions": [
				"function golfScore(par, strokes) {\n  if (strokes === 1) {\n    return \"Hole-in-one!\";\n  }\n  \n  if (strokes <= par - 2) {\n    return \"Eagle\";\n  }\n  \n  if (strokes === par - 1) {\n    return \"Birdie\";\n  }\n  \n  if (strokes === par) {\n    return \"Par\";\n  }\n  \n  if (strokes === par + 1) {\n    return \"Bogey\";\n  }\n  \n  if(strokes === par + 2) {\n    return \"Double Bogey\";\n  }\n  \n  return \"Go Home!\";\n}"
			],
			"tests": [
				"assert(golfScore(4, 1) === \"Hole-in-one!\", 'message: <code>golfScore(4, 1)</code> should return \"Hole-in-one!\"');",
				"assert(golfScore(4, 2) === \"Eagle\", 'message: <code>golfScore(4, 2)</code> should return \"Eagle\"');",
				"assert(golfScore(5, 2) === \"Eagle\", 'message: <code>golfScore(5, 2)</code> should return \"Eagle\"');",
				"assert(golfScore(4, 3) === \"Birdie\", 'message: <code>golfScore(4, 3)</code> should return \"Birdie\"');",
				"assert(golfScore(4, 4) === \"Par\", 'message: <code>golfScore(4, 4)</code> should return \"Par\"');",
				"assert(golfScore(1, 1) === \"Hole-in-one!\", 'message: <code>golfScore(1, 1)</code> should return \"Hole-in-one!\"');",
				"assert(golfScore(5, 5) === \"Par\", 'message: <code>golfScore(5, 5)</code> should return \"Par\"');",
				"assert(golfScore(4, 5) === \"Bogey\", 'message: <code>golfScore(4, 5)</code> should return \"Bogey\"');",
				"assert(golfScore(4, 6) === \"Double Bogey\", 'message: <code>golfScore(4, 6)</code> should return \"Double Bogey\"');",
				"assert(golfScore(4, 7) === \"Go Home!\", 'message: <code>golfScore(4, 7)</code> should return \"Go Home!\"');",
				"assert(golfScore(5, 9) === \"Go Home!\", 'message: <code>golfScore(5, 9)</code> should return \"Go Home!\"');"
			]
		},
		"golfCode": C.En(0)
	},
	"switchStatement": {
		"$meta": {
			"name": "Selecting from many options with Switch Statements",
			"icon": "code",
			"description": [
				"If you have many options to choose from, use a <code>switch</code> statement. A <code>switch</code> statement tests a value and can have many <code>case</code> statements which define various possible values. Statements are executed from the first matched <code>case</code> value until a <code>break</code> is encountered.",
				"Here is a <dfn>pseudocode</dfn> example:",
				"<blockquote>switch (num) {<br>  case value1:<br>    statement1;<br>    break;<br>  case value2:<br>    statement2;<br>    break;<br>...<br>  case valueN:<br>    statementN;<br>    break;<br>}</blockquote>",
				"<code>case</code> values are tested with strict equality (<code>===</code>). The <code>break</code> tells JavaScript to stop executing statements. If the <code>break</code> is omitted, the next statement will be executed.",
				"<hr>",
				"Write a switch statement which tests <code>val</code> and sets <code>answer</code> for the following conditions:<br><code>1</code> - \"alpha\"<br><code>2</code> - \"beta\"<br><code>3</code> - \"gamma\"<br><code>4</code> - \"delta\""
			],
			"code": [
				"function caseInSwitch(val) {",
				"  var answer = \"\";",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  ",
				"  // Only change code above this line  ",
				"  return answer;  ",
				"}",
				"",
				"// Change this value to test",
				"caseInSwitch(1);",
				""
			],
			"solutions": [
				"function caseInSwitch(val) {\n  var answer = \"\";\n\n  switch (val) {\n    case 1:\n      answer = \"alpha\";\n      break;\n    case 2:\n      answer = \"beta\";\n      break;\n    case 3:\n      answer = \"gamma\";\n      break;\n    case 4:\n      answer = \"delta\";\n  }\n  return answer;  \n}"
			],
			"tests": [
				"assert(caseInSwitch(1) === \"alpha\", 'message: <code>caseInSwitch(1)</code> should have a value of \"alpha\"');",
				"assert(caseInSwitch(2) === \"beta\", 'message: <code>caseInSwitch(2)</code> should have a value of \"beta\"');",
				"assert(caseInSwitch(3) === \"gamma\", 'message: <code>caseInSwitch(3)</code> should have a value of \"gamma\"');",
				"assert(caseInSwitch(4) === \"delta\", 'message: <code>caseInSwitch(4)</code> should have a value of \"delta\"');",
				"assert(!/else/g.test(code) || !/if/g.test(code), 'message: You should not use any <code>if</code> or <code>else</code> statements');",
				"assert(code.match(/break/g).length > 2, 'message: You should have at least 3 <code>break</code> statements');"
			]
		},
		"switchStatement": C.En(0)
	},
	"switchDefault": {
		"$meta": {
			"name": "Adding a default option in Switch statements",
			"icon": "code",
			"description": [
				"In a <code>switch</code> statement you may not be able to specify all possible values as <code>case</code> statements. Instead, you can add the <code>default</code> statement which will be executed if no matching <code>case</code> statements are found. Think of it like the final <code>else</code> statement in an <code>if/else</code> chain.",
				"A <code>default</code> statement should be the last case.",
				"<blockquote>switch (num) {<br>  case value1:<br>    statement1;<br>    break;<br>  case value2:<br>    statement2;<br>    break;<br>...<br>  default:<br>    defaultStatement;<br>}</blockquote>",
				"<hr>",
				"Write a switch statement to set <code>answer</code> for the following conditions:<br><code>\"a\"</code> - \"apple\"<br><code>\"b\"</code> - \"bird\"<br><code>\"c\"</code> - \"cat\"<br><code>default</code> - \"stuff\""
			],
			"code": [
				"function switchOfStuff(val) {",
				"  var answer = \"\";",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  ",
				"  // Only change code above this line  ",
				"  return answer;  ",
				"}",
				"",
				"// Change this value to test",
				"switchOfStuff(1);",
				""
			],
			"solutions": [
				"function switchOfStuff(val) {\n  var answer = \"\";\n\n  switch(val) {\n    case \"a\":\n      answer = \"apple\";\n      break;\n    case \"b\":\n      answer = \"bird\";\n      break;\n    case \"c\":\n      answer = \"cat\";\n      break;\n    default:\n      answer = \"stuff\";\n  }\n  return answer;  \n}"
			],
			"tests": [
				"assert(switchOfStuff(\"a\") === \"apple\", 'message: <code>switchOfStuff(\"a\")</code> should have a value of \"apple\"');",
				"assert(switchOfStuff(\"b\") === \"bird\", 'message: <code>switchOfStuff(\"b\")</code> should have a value of \"bird\"');",
				"assert(switchOfStuff(\"c\") === \"cat\", 'message: <code>switchOfStuff(\"c\")</code> should have a value of \"cat\"');",
				"assert(switchOfStuff(\"d\") === \"stuff\", 'message: <code>switchOfStuff(\"d\")</code> should have a value of \"stuff\"');",
				"assert(switchOfStuff(4) === \"stuff\", 'message: <code>switchOfStuff(4)</code> should have a value of \"stuff\"');",
				"assert(!/else/g.test(code) || !/if/g.test(code), 'message: You should not use any <code>if</code> or <code>else</code> statements');",
				"assert(switchOfStuff(\"string-to-trigger-default-case\") === \"stuff\", 'message: You should use a <code>default</code> statement');",
				"assert(code.match(/break/g).length > 2, 'message: You should have at least 3 <code>break</code> statements');"
			]
		},
		"switchDefault": C.En(0)
	},
	"identicalStatements": {
		"$meta": {
			"name": "Multiple Identical Options in Switch Statements",
			"icon": "code",
			"description": [
				"If the <code>break</code> statement is omitted from a <code>switch</code> statement's <code>case</code>, the following <code>case</code> statement(s) are executed until a <code>break</code> is encountered. If you have multiple inputs with the same output, you can represent them in a <code>switch</code> statement like this:",
				"<blockquote>switch(val) {<br>  case 1:<br>  case 2:<br>  case 3:<br>    result = \"1, 2, or 3\";<br>    break;<br>  case 4:<br>    result = \"4 alone\";<br>}</blockquote>",
				"Cases for 1, 2, and 3 will all produce the same result.",
				"<hr>",
				"Write a switch statement to set <code>answer</code> for the following ranges:<br><code>1-3</code> - \"Low\"<br><code>4-6</code> - \"Mid\"<br><code>7-9</code> - \"High\"",
				"<strong>Note</strong><br>You will need to have a <code>case</code> statement for each number in the range."
			],
			"code": [
				"function sequentialSizes(val) {",
				"  var answer = \"\";",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  ",
				"  // Only change code above this line  ",
				"  return answer;  ",
				"}",
				"",
				"// Change this value to test",
				"sequentialSizes(1);",
				""
			],
			"solutions": [
				"function sequentialSizes(val) {\n  var answer = \"\";\n  \n  switch (val) {\n    case 1:\n    case 2:\n    case 3:\n      answer = \"Low\";\n      break;\n    case 4:\n    case 5:\n    case 6:\n      answer = \"Mid\";\n      break;\n    case 7:\n    case 8:\n    case 9:\n      answer = \"High\";\n  }\n  \n  return answer;  \n}"
			],
			"tests": [
				"assert(sequentialSizes(1) === \"Low\", 'message: <code>sequentialSizes(1)</code> should return \"Low\"');",
				"assert(sequentialSizes(2) === \"Low\", 'message: <code>sequentialSizes(2)</code> should return \"Low\"');",
				"assert(sequentialSizes(3) === \"Low\", 'message: <code>sequentialSizes(3)</code> should return \"Low\"');",
				"assert(sequentialSizes(4) === \"Mid\", 'message: <code>sequentialSizes(4)</code> should return \"Mid\"');",
				"assert(sequentialSizes(5) === \"Mid\", 'message: <code>sequentialSizes(5)</code> should return \"Mid\"');",
				"assert(sequentialSizes(6) === \"Mid\", 'message: <code>sequentialSizes(6)</code> should return \"Mid\"');",
				"assert(sequentialSizes(7) === \"High\", 'message: <code>sequentialSizes(7)</code> should return \"High\"');",
				"assert(sequentialSizes(8) === \"High\", 'message: <code>sequentialSizes(8)</code> should return \"High\"');",
				"assert(sequentialSizes(9) === \"High\", 'message: <code>sequentialSizes(9)</code> should return \"High\"');",
				"assert(!/else/g.test(code) || !/if/g.test(code), 'message: You should not use any <code>if</code> or <code>else</code> statements');",
				"assert(code.match(/case/g).length === 9, 'message: You should have nine <code>case</code> statements');"
			]
		},
		"identicalStatements": C.En(0)
	},
	"replaceIfElseWithSwitch": {
		"$meta": {
			"name": "Replacing If Else Chains with Switch",
			"icon": "code",
			"description": [
				"If you have many options to choose from, a <code>switch</code> statement can be easier to write than many chained <code>if</code>/<code>else if</code> statements. The following:",
				"<blockquote>if (val === 1) {<br>  answer = \"a\";<br>} else if (val === 2) {<br>  answer = \"b\";<br>} else {<br>  answer = \"c\";<br>}</blockquote>",
				"can be replaced with:",
				"<blockquote>switch (val) {<br>  case 1:<br>    answer = \"a\";<br>    break;<br>  case 2:<br>    answer = \"b\";<br>    break;<br>  default:<br>    answer = \"c\";<br>}</blockquote>",
				"<hr>",
				"Change the chained <code>if</code>/<code>else if</code> statements into a <code>switch</code> statement."
			],
			"code": [
				"function chainToSwitch(val) {",
				"  var answer = \"\";",
				"  // Only change code below this line",
				"  ",
				"  if (val === \"bob\") {",
				"    answer = \"Marley\";",
				"  } else if (val === 42) {",
				"    answer = \"The Answer\";",
				"  } else if (val === 1) {",
				"    answer = \"There is no #1\";",
				"  } else if (val === 99) {",
				"    answer = \"Missed me by this much!\";",
				"  } else if (val === 7) {",
				"    answer = \"Ate Nine\";",
				"  }",
				"  ",
				"  // Only change code above this line  ",
				"  return answer;  ",
				"}",
				"",
				"// Change this value to test",
				"chainToSwitch(7);",
				""
			],
			"solutions": [
				"function chainToSwitch(val) {\n  var answer = \"\";\n\n  switch (val) {\n    case \"bob\":\n      answer = \"Marley\";\n      break;\n    case 42:\n      answer = \"The Answer\";\n      break;\n    case 1:\n      answer = \"There is no #1\";\n      break;\n    case 99:\n      answer = \"Missed me by this much!\";\n      break;\n    case 7:\n      answer = \"Ate Nine\";\n  }\n  return answer;  \n}"
			],
			"tests": [
				"assert(!/else/g.test(code), 'message: You should not use any <code>else</code> statements anywhere in the editor');",
				"assert(!/if/g.test(code), 'message: You should not use any <code>if</code> statements anywhere in the editor');",
				"assert(code.match(/break/g).length >= 4, 'message: You should have at least four <code>break</code> statements');",
				"assert(chainToSwitch(\"bob\") === \"Marley\", 'message: <code>chainToSwitch(\"bob\")</code> should be \"Marley\"');",
				"assert(chainToSwitch(42) === \"The Answer\", 'message: <code>chainToSwitch(42)</code> should be \"The Answer\"');",
				"assert(chainToSwitch(1) === \"There is no #1\", 'message: <code>chainToSwitch(1)</code> should be \"There is no #1\"');",
				"assert(chainToSwitch(99) === \"Missed me by this much!\", 'message: <code>chainToSwitch(99)</code> should be \"Missed me by this much!\"');",
				"assert(chainToSwitch(7) === \"Ate Nine\", 'message: <code>chainToSwitch(7)</code> should be \"Ate Nine\"');",
				"assert(chainToSwitch(\"John\") === \"\", 'message: <code>chainToSwitch(\"John\")</code> should be \"\" (empty string)');",
				"assert(chainToSwitch(156) === \"\", 'message: <code>chainToSwitch(156)</code> should be \"\" (empty string)');"
			]
		},
		"replaceIfElseWithSwitch": C.En(0)
	},
	"returnBoolean": {
		"$meta": {
			"name": "Returning Boolean Values from Functions",
			"icon": "code",
			"description": [
				"You may recall from <a href=\"waypoint-comparison-with-the-equality-operator\" target=\"_blank\">Comparison with the Equality Operator</a> that all comparison operators return a boolean <code>true</code> or <code>false</code> value.",
				"Sometimes people use an if/else statement to do a comparison, like this:",
				"<blockquote>function isEqual(a,b) {<br>  if (a === b) {<br>    return true;<br>  } else {<br>    return false;<br>  }<br>}</blockquote>",
				"But there's a better way to do this. Since <code>===</code> returns <code>true</code> or <code>false</code>, we can return the result of the comparison:",
				"<blockquote>function isEqual(a,b) {<br>  return a === b;<br>}</blockquote>",
				"<hr>",
				"Fix the function <code>isLess</code> to remove the <code>if/else</code> statements."
			],
			"code": [
				"function isLess(a, b) {",
				"  // Fix this code",
				"  if (a < b) {",
				"    return true;",
				"  } else {",
				"    return false;",
				"  }",
				"}",
				"",
				"// Change these values to test",
				"isLess(10, 15);"
			],
			"solutions": [
				"function isLess(a, b) {\n  return a < b;\n}"
			],
			"tests": [
				"assert(isLess(10,15) === true, 'message: <code>isLess(10,15)</code> should return <code>true</code>');",
				"assert(isLess(15, 10) === false, 'message: <code>isLess(15,10)</code> should return <code>false</code>');",
				"assert(!/if|else/g.test(code), 'message: You should not use any <code>if</code> or <code>else</code> statements');"
			]
		},
		"returnBoolean": C.En(0)
	},
	"returnPattern": {
		"$meta": {
			"name": "Return Early Pattern for Functions",
			"icon": "code",
			"description": [
				"When a <code>return</code> statement is reached, the execution of the current function stops and control returns to the calling location.",
				"<strong>Example</strong>",
				"<blockquote>function myFun() {<br>  console.log(\"Hello\");<br>  return \"World\";<br>  console.log(\"byebye\")<br>}<br>myFun();</blockquote>",
				"The above outputs \"Hello\" to the console, returns \"World\", but <code>\"byebye\"</code> is never output, because the function exits at the <code>return</code> statement.",
				"<hr>",
				"Modify the function <code>abTest</code> so that if <code>a</code> or <code>b</code> are less than <code>0</code> the function will immediately exit with a value of <code>undefined</code>.",
				"<strong>Hint</strong><br>Remember that <a href='http://www.freeCodeCamp.com/challenges/understanding-uninitialized-variables' target='_blank'><code>undefined</code> is a keyword</a>, not a string."
			],
			"code": [
				"// Setup",
				"function abTest(a, b) {",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  ",
				"  // Only change code above this line",
				"",
				"  return Math.round(Math.pow(Math.sqrt(a) + Math.sqrt(b), 2));",
				"}",
				"",
				"// Change values below to test your code",
				"abTest(2,2);"
			],
			"solutions": [
				"function abTest(a, b) {\n  if(a < 0 || b < 0) {\n    return undefined;\n  } \n  return Math.round(Math.pow(Math.sqrt(a) + Math.sqrt(b), 2));\n}"
			],
			"tests": [
				"assert(typeof abTest(2,2) === 'number' , 'message: <code>abTest(2,2)</code> should return a number');",
				"assert(abTest(2,2) === 8 , 'message: <code>abTest(2,2)</code> should return <code>8</code>');",
				"assert(abTest(-2,2) === undefined , 'message: <code>abTest(-2,2)</code> should return <code>undefined</code>');",
				"assert(abTest(2,-2) === undefined , 'message: <code>abTest(2,-2)</code> should return <code>undefined</code>');",
				"assert(abTest(2,8) === 18 , 'message: <code>abTest(2,8)</code> should return <code>18</code>');",
				"assert(abTest(3,3) === 12 , 'message: <code>abTest(3,3)</code> should return <code>12</code>');"
			]
		},
		"returnPattern": C.En(0)
	},
	"countingCards": {
		"$meta": {
			"name": "Counting Cards",
			"icon": "code",
			"description": [
				"In the casino game Blackjack, a player can gain an advantage over the house by keeping track of the relative number of high and low cards remaining in the deck. This is called <a href='https://en.wikipedia.org/wiki/Card_counting' target='_blank'>Card Counting</a>.",
				"Having more high cards remaining in the deck favors the player. Each card is assigned a value according to the table below. When the count is positive, the player should bet high. When the count is zero or negative, the player should bet low.",
				"<table class=\"table table-striped\"><thead><tr><th>Count Change</th><th>Cards</th></tr></thead><tbody><tr><td>+1</td><td>2, 3, 4, 5, 6</td></tr><tr><td>0</td><td>7, 8, 9</td></tr><tr><td>-1</td><td>10, 'J', 'Q', 'K', 'A'</td></tr></tbody></table>",
				"You will write a card counting function. It will receive a <code>card</code> parameter, which can be a number or a string, and increment or decrement the global <code>count</code> variable according to the card's value (see table). The function will then return a string with the current count and the string <code>Bet</code> if the count is positive, or <code>Hold</code> if the count is zero or negative. The current count and the player's decision (<code>Bet</code> or <code>Hold</code>) should be separated by a single space.",
				"<strong>Example Output</strong><br><code>-3 Hold</code><br><code>5 Bet</code>",
				"<strong>Hint</strong><br>Do NOT reset <code>count</code> to 0 when value is 7, 8, or 9.<br>Do NOT return an array.<br>Do NOT include quotes (single or double) in the output."
			],
			"code": [
				"var count = 0;",
				"",
				"function cc(card) {",
				"  // Only change code below this line",
				"  ",
				"  ",
				"  return \"Change Me\";",
				"  // Only change code above this line",
				"}",
				"",
				"// Add/remove calls to test your function.",
				"// Note: Only the last will display",
				"cc(2); cc(3); cc(7); cc('K'); cc('A');"
			],
			"solutions": [
				"var count = 0;\nfunction cc(card) {\n  switch(card) {\n    case 2:\n    case 3:\n    case 4:\n    case 5:\n    case 6:\n      count++;\n      break;\n    case 10:\n    case 'J':\n    case 'Q':\n    case 'K':\n    case 'A':\n      count--;\n  }\n  if(count > 0) {\n    return count + \" Bet\";\n  } else {\n    return count + \" Hold\";\n  }\n}"
			],
			"tests": [
				"assert((function(){ count = 0; cc(2);cc(3);cc(4);cc(5);var out = cc(6); if(out === \"5 Bet\") {return true;} return false; })(), 'message: Cards Sequence 2, 3, 4, 5, 6 should return <code>5 Bet</code>');",
				"assert((function(){ count = 0; cc(7);cc(8);var out = cc(9); if(out === \"0 Hold\") {return true;} return false; })(), 'message: Cards Sequence 7, 8, 9 should return <code>0 Hold</code>');",
				"assert((function(){ count = 0; cc(10);cc('J');cc('Q');cc('K');var out = cc('A'); if(out === \"-5 Hold\") {return true;} return false; })(), 'message: Cards Sequence 10, J, Q, K, A should return <code>-5 Hold</code>');",
				"assert((function(){ count = 0; cc(3);cc(7);cc('Q');cc(8);var out = cc('A'); if(out === \"-1 Hold\") {return true;} return false; })(), 'message: Cards Sequence 3, 7, Q, 8, A should return <code>-1 Hold</code>');",
				"assert((function(){ count = 0; cc(2);cc('J');cc(9);cc(2);var out = cc(7); if(out === \"1 Bet\") {return true;} return false; })(), 'message: Cards Sequence 2, J, 9, 2, 7 should return <code>1 Bet</code>');",
				"assert((function(){ count = 0; cc(2);cc(2);var out = cc(10); if(out === \"1 Bet\") {return true;} return false; })(), 'message: Cards Sequence 2, 2, 10 should return <code>1 Bet</code>');",
				"assert((function(){ count = 0; cc(3);cc(2);cc('A');cc(10);var out = cc('K'); if(out === \"-1 Hold\") {return true;} return false; })(), 'message: Cards Sequence 3, 2, A, 10, K should return <code>-1 Hold</code>');"
			]
		},
		"countingCards": C.En(0)
	},
	"objects": {
		"$meta": {
			"name": "Build JavaScript Objects",
			"icon": "code",
			"description": [
				"You may have heard the term <code>object</code> before.",
				"Objects are similar to <code>arrays</code>, except that instead of using indexes to access and modify their data, you access the data in objects through what are called <code>properties</code>.",
				"Here's a sample object:",
				"<blockquote>var cat = {<br>  \"name\": \"Whiskers\",<br>  \"legs\": 4,<br>  \"tails\": 1,<br>  \"enemies\": [\"Water\", \"Dogs\"]<br>};</blockquote>",
				"Objects are useful for storing data in a structured way, and can represent real world objects, like a cat.",
				"<hr>",
				"Make an object that represents a dog called <code>myDog</code> which contains the properties <code>\"name\"</code> (a string), <code>\"legs\"</code>, <code>\"tails\"</code> and <code>\"friends\"</code>.",
				"You can set these object properties to whatever values you want, as long <code>\"name\"</code> is a string, <code>\"legs\"</code> and <code>\"tails\"</code> are numbers, and <code>\"friends\"</code> is an array."
			],
			"code": [
				"// Example",
				"var ourDog = {",
				"  \"name\": \"Camper\",",
				"  \"legs\": 4,",
				"  \"tails\": 1,",
				"  \"friends\": [\"everything!\"]",
				"};",
				"",
				"// Only change code below this line.",
				"",
				"var myDog = {",
				"  ",
				"  ",
				"  ",
				"  ",
				"};"
			],
			"solutions": [
				"var myDog = {\n  \"name\": \"Camper\",\n  \"legs\": 4,\n  \"tails\": 1,\n  \"friends\": [\"everything!\"]  \n};"
			],
			"tests": [
				"assert((function(z){if(z.hasOwnProperty(\"name\") && z.name !== undefined && typeof z.name === \"string\"){return true;}else{return false;}})(myDog), 'message: <code>myDog</code> should contain the property <code>name</code> and it should be a <code>string</code>.');",
				"assert((function(z){if(z.hasOwnProperty(\"legs\") && z.legs !== undefined && typeof z.legs === \"number\"){return true;}else{return false;}})(myDog), 'message: <code>myDog</code> should contain the property <code>legs</code> and it should be a <code>number</code>.');",
				"assert((function(z){if(z.hasOwnProperty(\"tails\") && z.tails !== undefined && typeof z.tails === \"number\"){return true;}else{return false;}})(myDog), 'message: <code>myDog</code> should contain the property <code>tails</code> and it should be a <code>number</code>.');",
				"assert((function(z){if(z.hasOwnProperty(\"friends\") && z.friends !== undefined && Array.isArray(z.friends)){return true;}else{return false;}})(myDog), 'message: <code>myDog</code> should contain the property <code>friends</code> and it should be an <code>array</code>.');",
				"assert((function(z){return Object.keys(z).length === 4;})(myDog), 'message: <code>myDog</code> should only contain all the given properties.');"
			]
		},
		"objects": C.En(0)
	},
	"objectsPropertiesDot": {
		"$meta": {
			"name": "Accessing Objects Properties with the Dot Operator",
			"icon": "code",
			"description": [
				"There are two ways to access the properties of an object: the dot operator (<code>.</code>) and bracket notation (<code>[]</code>), similar to an array.",
				"The dot operator is what you use when you know the name of the property you're trying to access ahead of time.",
				"Here is a sample of using the dot operator (<code>.</code>) to read an object property:",
				"<blockquote>var myObj = {<br>  prop1: \"val1\",<br>  prop2: \"val2\"<br>};<br>var prop1val = myObj.prop1; // val1<br>var prop2val = myObj.prop2; // val2</blockquote>",
				"<hr>",
				"Read in the property values of <code>testObj</code> using dot notation. Set the variable <code>hatValue</code> equal to the object property <code>hat</code> and set the variable <code>shirtValue</code> equal to the object property <code>shirt</code>."
			],
			"code": [
				"// Setup",
				"var testObj = {",
				"  \"hat\": \"ballcap\",",
				"  \"shirt\": \"jersey\",",
				"  \"shoes\": \"cleats\"",
				"};",
				"",
				"// Only change code below this line",
				"",
				"var hatValue = testObj;      // Change this line",
				"var shirtValue = testObj;    // Change this line"
			],
			"solutions": [
				"var testObj = {\n  \"hat\": \"ballcap\",\n  \"shirt\": \"jersey\",\n  \"shoes\": \"cleats\"\n};\n\nvar hatValue = testObj.hat;  \nvar shirtValue = testObj.shirt;"
			],
			"tests": [
				"assert(typeof hatValue === 'string' , 'message: <code>hatValue</code> should be a string');",
				"assert(hatValue === 'ballcap' , 'message: The value of <code>hatValue</code> should be <code>\"ballcap\"</code>');",
				"assert(typeof shirtValue === 'string' , 'message: <code>shirtValue</code> should be a string');",
				"assert(shirtValue === 'jersey' , 'message: The value of <code>shirtValue</code> should be <code>\"jersey\"</code>');",
				"assert(code.match(/testObj\\.\\w+/g).length > 1, 'message: You should use dot notation twice');"
			]
		},
		"objectsPropertiesDot": C.En(0)
	},
	"objectsPropertiesBrackets": {
		"$meta": {
			"name": "Accessing Objects Properties with Bracket Notation",
			"icon": "code",
			"description": [
				"The second way to access the properties of an object is bracket notation (<code>[]</code>). If the property of the object you are trying to access has a space in it's name, you will need to use bracket notation.",
				"Here is a sample of using bracket notation to read an object property:",
				"<blockquote>var myObj = {<br>  \"Space Name\": \"Kirk\",<br>  \"More Space\": \"Spock\"<br>};<br>myObj[\"Space Name\"]; // Kirk<br>myObj['More Space']; // Spock</blockquote>",
				"Note that property names with spaces in them must be in quotes (single or double).",
				"<hr>",
				"Read the values of the properties <code>\"an entree\"</code> and <code>\"the drink\"</code> of <code>testObj</code> using bracket notation and assign them to <code>entreeValue</code> and <code>drinkValue</code> respectively."
			],
			"code": [
				"// Setup",
				"var testObj = {",
				"  \"an entree\": \"hamburger\",",
				"  \"my side\": \"veggies\",",
				"  \"the drink\": \"water\"",
				"};",
				"",
				"// Only change code below this line",
				"",
				"var entreeValue = testObj;   // Change this line",
				"var drinkValue = testObj;    // Change this line"
			],
			"solutions": [
				"var testObj = {\n  \"an entree\": \"hamburger\",\n  \"my side\": \"veggies\",\n  \"the drink\": \"water\"\n};\nvar entreeValue = testObj[\"an entree\"];\nvar drinkValue = testObj['the drink'];"
			],
			"tests": [
				"assert(typeof entreeValue === 'string' , 'message: <code>entreeValue</code> should be a string');",
				"assert(entreeValue === 'hamburger' , 'message: The value of <code>entreeValue</code> should be <code>\"hamburger\"</code>');",
				"assert(typeof drinkValue === 'string' , 'message: <code>drinkValue</code> should be a string');",
				"assert(drinkValue === 'water' , 'message: The value of <code>drinkValue</code> should be <code>\"water\"</code>');",
				"assert(code.match(/testObj\\s*?\\[('|\")[^'\"]+\\1\\]/g).length > 1, 'message: You should use bracket notation twice');"
			]
		},
		"objectsPropertiesBrackets": C.En(0)
	},
	"objectsPropertiesVariables": {
		"$meta": {
			"name": "Accessing Objects Properties with Variables",
			"icon": "code",
			"description": [
				"Another use of bracket notation on objects is to use a variable to access a property. This can be very useful for iterating through lists of the object properties or for doing the lookup.",
				"Here is an example of using a variable to access a property:",
				"<blockquote>var someProp = \"propName\";<br>var myObj = {<br>  propName: \"Some Value\"<br >}<br>myObj[someProp]; // \"Some Value\"</blockquote>",
				"Here is one more:",
				"<blockquote>var myDog = \"Hunter\";<br>var dogs = {<br>  Fido: \"Mutt\",\n  Hunter: \"Doberman\",\n  Snoopie: \"Beagle\"<br >}<br>var breed = dogs[myDog];<br>console.log(breed);// \"Doberman\"</blockquote>",
				"Note that we  do <em>not</em> use quotes around the variable name when using it to access the property because we are using the <em>value</em> of the variable, not the <em>name</em>",
				"<hr>",
				"Use the <code>playerNumber</code> variable to lookup player <code>16</code> in <code>testObj</code> using bracket notation. Then assign that name to the <code>player</code> variable."
			],
			"code": [
				"// Setup",
				"var testObj = {",
				"  12: \"Namath\",",
				"  16: \"Montana\",",
				"  19: \"Unitas\"",
				"};",
				"",
				"// Only change code below this line;",
				"",
				"var playerNumber;       // Change this Line",
				"var player = testObj;   // Change this Line"
			],
			"solutions": [
				"var testObj = {\n  12: \"Namath\",\n  16: \"Montana\",\n  19: \"Unitas\"\n};\nvar playerNumber = 16;\nvar player = testObj[playerNumber];"
			],
			"tests": [
				"assert(typeof playerNumber === 'number', 'message: <code>playerNumber</code> should be a number');",
				"assert(typeof player === 'string', 'message: The variable <code>player</code> should be a string');",
				"assert(player === 'Montana', 'message: The value of <code>player</code> should be \"Montana\"');",
				"assert(/testObj\\s*?\\[.*?\\]/.test(code),'message: You should use bracket notation to access <code>testObj</code>');",
				"assert(/testObj\\s*?\\[\\s*playerNumber\\s*\\]/.test(code),'message: You should be using the variable <code>playerNumber</code> in your bracket notation');"
			]
		},
		"objectsPropertiesVariables": C.En(0)
	},
	"updatingProperties": {
		"$meta": {
			"name": "Updating Object Properties",
			"icon": "code",
			"description": [
				"After you've created a JavaScript object, you can update its properties at any time just like you would update any other variable. You can use either dot or bracket notation to update.",
				"For example, let's look at <code>ourDog</code>:",
				"<blockquote>var ourDog = {<br>  \"name\": \"Camper\",<br>  \"legs\": 4,<br>  \"tails\": 1,<br>  \"friends\": [\"everything!\"]<br>};</blockquote>",
				"Since he's a particularly happy dog, let's change his name to \"Happy Camper\". Here's how we update his object's name property:",
				"<code>ourDog.name = \"Happy Camper\";</code> or",
				"<code>ourDog[\"name\"] = \"Happy Camper\";</code>",
				"Now when we evaluate <code>ourDog.name</code>, instead of getting \"Camper\", we'll get his new name, \"Happy Camper\".",
				"<hr>",
				"Update the <code>myDog</code> object's name property. Let's change her name from \"Coder\" to \"Happy Coder\". You can use either dot or bracket notation."
			],
			"code": [
				"// Example",
				"var ourDog = {",
				"  \"name\": \"Camper\",",
				"  \"legs\": 4,",
				"  \"tails\": 1,",
				"  \"friends\": [\"everything!\"]",
				"};",
				"",
				"ourDog.name = \"Happy Camper\";",
				"",
				"// Setup",
				"var myDog = {",
				"  \"name\": \"Coder\",",
				"  \"legs\": 4,",
				"  \"tails\": 1,",
				"  \"friends\": [\"freeCodeCamp Campers\"]",
				"};",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var myDog = {\n  \"name\": \"Coder\",\n  \"legs\": 4,\n  \"tails\": 1,\n  \"friends\": [\"freeCodeCamp Campers\"]\n};\nmyDog.name = \"Happy Coder\";"
			],
			"tests": [
				"assert(/happy coder/gi.test(myDog.name), 'message: Update <code>myDog</code>&apos;s <code>\"name\"</code> property to equal \"Happy Coder\".');",
				"assert(/\"name\": \"Coder\"/.test(code), 'message: Do not edit the <code>myDog</code> definition');"
			]
		},
		"updatingProperties": C.En(0)
	},
	"newProperty": {
		"$meta": {
			"name": "Add New Properties to a JavaScript Object",
			"icon": "code",
			"description": [
				"You can add new properties to existing JavaScript objects the same way you would modify them.",
				"Here's how we would add a <code>\"bark\"</code> property to <code>ourDog</code>:",
				"<code>ourDog.bark = \"bow-wow\";</code> ",
				"or",
				"<code>ourDog[\"bark\"] = \"bow-wow\";</code>",
				"Now when we evaluate <code>ourDog.bark</code>, we'll get his bark, \"bow-wow\".",
				"<hr>",
				"Add a <code>\"bark\"</code> property to <code>myDog</code> and set it to a dog sound, such as \"woof\". You may use either dot or bracket notation."
			],
			"code": [
				"// Example",
				"var ourDog = {",
				"  \"name\": \"Camper\",",
				"  \"legs\": 4,",
				"  \"tails\": 1,",
				"  \"friends\": [\"everything!\"]",
				"};",
				"",
				"ourDog.bark = \"bow-wow\";",
				"",
				"// Setup",
				"var myDog = {",
				"  \"name\": \"Happy Coder\",",
				"  \"legs\": 4,",
				"  \"tails\": 1,",
				"  \"friends\": [\"freeCodeCamp Campers\"]",
				"};",
				"",
				"// Only change code below this line.",
				""
			],
			"solutions": [
				"var myDog = {\n  \"name\": \"Happy Coder\",\n  \"legs\": 4,\n  \"tails\": 1,\n  \"friends\": [\"freeCodeCamp Campers\"]\n};\nmyDog.bark = \"Woof Woof\";"
			],
			"tests": [
				"assert(myDog.bark !== undefined, 'message: Add the property <code>\"bark\"</code> to <code>myDog</code>.');",
				"assert(!/bark[^\\n]:/.test(code), 'message: Do not add <code>\"bark\"</code> to the setup section');"
			]
		},
		"newProperty": C.En(0)
	},
	"deleteProperties": {
		"$meta": {
			"name": "Delete Properties from a JavaScript Object",
			"icon": "code",
			"description": [
				"We can also delete properties from objects like this:",
				"<code>delete ourDog.bark;</code>",
				"<hr>",
				"Delete the <code>\"tails\"</code> property from <code>myDog</code>. You may use either dot or bracket notation."
			],
			"code": [
				"// Example",
				"var ourDog = {",
				"  \"name\": \"Camper\",",
				"  \"legs\": 4,",
				"  \"tails\": 1,",
				"  \"friends\": [\"everything!\"],",
				"  \"bark\": \"bow-wow\"",
				"};",
				"",
				"delete ourDog.bark;",
				"",
				"// Setup",
				"var myDog = {",
				"  \"name\": \"Happy Coder\",",
				"  \"legs\": 4,",
				"  \"tails\": 1,",
				"  \"friends\": [\"freeCodeCamp Campers\"],",
				"  \"bark\": \"woof\"",
				"};",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var ourDog = {\n  \"name\": \"Camper\",\n  \"legs\": 4,\n  \"tails\": 1,\n  \"friends\": [\"everything!\"],\n  \"bark\": \"bow-wow\"\n};\nvar myDog = {\n  \"name\": \"Happy Coder\",\n  \"legs\": 4,\n  \"tails\": 1,\n  \"friends\": [\"freeCodeCamp Campers\"],\n  \"bark\": \"woof\"\n};\ndelete myDog.tails;"
			],
			"tests": [
				"assert(typeof myDog === \"object\" && myDog.tails === undefined, 'message: Delete the property <code>\"tails\"</code> from <code>myDog</code>.');",
				"assert(code.match(/\"tails\": 1/g).length > 1, 'message: Do not modify the <code>myDog</code> setup');"
			]
		},
		"deleteProperties": C.En(0)
	},
	"objectLookups": {
		"$meta": {
			"name": "Using Objects for Lookups",
			"icon": "code",
			"description": [
				"Objects can be thought of as a key/value storage, like a dictionary. If you have tabular data, you can use an object to \"lookup\" values rather than a <code>switch</code> statement or an <code>if/else</code> chain. This is most useful when you know that your input data is limited to a certain range.",
				"Here is an example of a simple reverse alphabet lookup:",
				"<blockquote>var alpha = {<br>  1:\"Z\",<br>  2:\"Y\",<br>  3:\"X\",<br>  4:\"W\",<br>  ...<br>  24:\"C\",<br>  25:\"B\",<br>  26:\"A\"<br>};<br>alpha[2]; // \"Y\"<br>alpha[24]; // \"C\"<br><br>var value = 2;<br>alpha[value]; // \"Y\"</blockquote>",
				"<hr>",
				"Convert the switch statement into a lookup table called <code>lookup</code>. Use it to lookup <code>val</code> and assign the associated string to the <code>result</code> variable."
			],
			"code": [
				"// Setup",
				"function phoneticLookup(val) {",
				"  var result = \"\";",
				"",
				"  // Only change code below this line",
				"  switch(val) {",
				"    case \"alpha\": ",
				"      result = \"Adams\";",
				"      break;",
				"    case \"bravo\": ",
				"      result = \"Boston\";",
				"      break;",
				"    case \"charlie\": ",
				"      result = \"Chicago\";",
				"      break;",
				"    case \"delta\": ",
				"      result = \"Denver\";",
				"      break;",
				"    case \"echo\": ",
				"      result = \"Easy\";",
				"      break;",
				"    case \"foxtrot\": ",
				"      result = \"Frank\";",
				"  }",
				"",
				"  // Only change code above this line",
				"  return result;",
				"}",
				"",
				"// Change this value to test",
				"phoneticLookup(\"charlie\");"
			],
			"solutions": [
				"function phoneticLookup(val) {\n  var result = \"\";\n\n  var lookup = {\n    alpha: \"Adams\",\n    bravo: \"Boston\",\n    charlie: \"Chicago\",\n    delta: \"Denver\",\n    echo: \"Easy\",\n    foxtrot: \"Frank\"\n  };\n\n  result = lookup[val];\n\n  return result;\n}"
			],
			"tests": [
				"assert(phoneticLookup(\"alpha\") === 'Adams', 'message: <code>phoneticLookup(\"alpha\")</code> should equal <code>\"Adams\"</code>');",
				"assert(phoneticLookup(\"bravo\") === 'Boston', 'message: <code>phoneticLookup(\"bravo\")</code> should equal <code>\"Boston\"</code>');",
				"assert(phoneticLookup(\"charlie\") === 'Chicago', 'message: <code>phoneticLookup(\"charlie\")</code> should equal <code>\"Chicago\"</code>');",
				"assert(phoneticLookup(\"delta\") === 'Denver', 'message: <code>phoneticLookup(\"delta\")</code> should equal <code>\"Denver\"</code>');",
				"assert(phoneticLookup(\"echo\") === 'Easy', 'message: <code>phoneticLookup(\"echo\")</code> should equal <code>\"Easy\"</code>');",
				"assert(phoneticLookup(\"foxtrot\") === 'Frank', 'message: <code>phoneticLookup(\"foxtrot\")</code> should equal <code>\"Frank\"</code>');",
				"assert(typeof phoneticLookup(\"\") === 'undefined', 'message: <code>phoneticLookup(\"\")</code> should equal <code>undefined</code>');",
				"assert(code.match(/return\\sresult;/), 'message: You should not modify the <code>return</code> statement');",
				"assert(!/case|switch|if/g.test(code), 'message: You should not use <code>case</code>, <code>switch</code>, or <code>if</code> statements'); "
			]
		},
		"objectLookups": C.En(0)
	},
	"testingObjects": {
		"$meta": {
			"name": "Testing Objects for Properties",
			"icon": "code",
			"description": [
				"Sometimes it is useful to check if the property of a given object exists or not. We can use the <code>.hasOwnProperty(propname)</code> method of objects to determine if that object has the given property name. <code>.hasOwnProperty()</code> returns <code>true</code> or <code>false</code> if the property is found or not.",
				"<strong>Example</strong>",
				"<blockquote>var myObj = {<br>  top: \"hat\",<br>  bottom: \"pants\"<br>};<br>myObj.hasOwnProperty(\"top\");    // true<br>myObj.hasOwnProperty(\"middle\"); // false</blockquote>",
				"<hr>",
				"Modify the function <code>checkObj</code> to test <code>myObj</code> for <code>checkProp</code>. If the property is found, return that property's value. If not, return <code>\"Not Found\"</code>."
			],
			"code": [
				"// Setup",
				"var myObj = {",
				"  gift: \"pony\",",
				"  pet: \"kitten\",",
				"  bed: \"sleigh\"",
				"};",
				"",
				"function checkObj(checkProp) {",
				"  // Your Code Here",
				"  ",
				"  return \"Change Me!\";",
				"}",
				"",
				"// Test your code by modifying these values",
				"checkObj(\"gift\");"
			],
			"solutions": [
				"var myObj = {\n  gift: \"pony\",\n  pet: \"kitten\",\n  bed: \"sleigh\"\n};\nfunction checkObj(checkProp) {\n  if(myObj.hasOwnProperty(checkProp)) {\n    return myObj[checkProp];\n  } else {\n    return \"Not Found\";\n  }\n}"
			],
			"tests": [
				"assert(checkObj(\"gift\") === \"pony\", 'message: <code>checkObj(\"gift\")</code> should return  <code>\"pony\"</code>.');",
				"assert(checkObj(\"pet\") === \"kitten\", 'message: <code>checkObj(\"pet\")</code> should return  <code>\"kitten\"</code>.');",
				"assert(checkObj(\"house\") === \"Not Found\", 'message: <code>checkObj(\"house\")</code> should return  <code>\"Not Found\"</code>.');"
			]
		},
		"testingObjects": C.En(0)
	},
	"complexObjects": {
		"$meta": {
			"name": "Manipulating Complex Objects",
			"icon": "code",
			"description": [
				"Sometimes you may want to store data in a flexible <dfn>Data Structure</dfn>. A JavaScript object is one way to handle flexible data. They allow for arbitrary combinations of <dfn>strings</dfn>, <dfn>numbers</dfn>, <dfn>booleans</dfn>, <dfn>arrays</dfn>, <dfn>functions</dfn>, and <dfn>objects</dfn>.",
				"Here's an example of a complex data structure:",
				"<blockquote>var ourMusic = [<br>  {<br>    \"artist\": \"Daft Punk\",<br>    \"title\": \"Homework\",<br>    \"release_year\": 1997,<br>    \"formats\": [ <br>      \"CD\", <br>      \"Cassette\", <br>      \"LP\"<br>    ],<br>    \"gold\": true<br>  }<br>];</blockquote>",
				"This is an array which contains one object inside. The object has various pieces of <dfn>metadata</dfn> about an album. It also has a nested <code>\"formats\"</code> array. If you want to add more album records, you can do this by adding records to the top level array.",
				"Objects hold data in a property, which has a key-value format. In the example above, <code>\"artist\": \"Daft Punk\"</code> is a property that has a key of <code>\"artist\"</code> and a value of <code>\"Daft Punk\"</code>.",
				"<a href='http://www.json.org/' target=_blank>JavaScript Object Notation</a> or <code>JSON</code> is a related data interchange format used to store data.",
				"<blockquote>{<br>  \"artist\": \"Daft Punk\",<br>  \"title\": \"Homework\",<br>  \"release_year\": 1997,<br>  \"formats\": [ <br>    \"CD\",<br>    \"Cassette\",<br>    \"LP\"<br>  ],<br>  \"gold\": true<br>}</blockquote>",
				"<strong>Note</strong><br>You will need to place a comma after every object in the array, unless it is the last object in the array.",
				"<hr>",
				"Add a new album to the <code>myMusic</code> array. Add <code>artist</code> and <code>title</code> strings, <code>release_year</code> number, and a <code>formats</code> array of strings."
			],
			"code": [
				"var myMusic = [",
				"  {",
				"    \"artist\": \"Billy Joel\",",
				"    \"title\": \"Piano Man\",",
				"    \"release_year\": 1973,",
				"    \"formats\": [ ",
				"      \"CS\",",
				"      \"8T\",",
				"      \"LP\"",
				"    ],",
				"    \"gold\": true",
				"  }",
				"  // Add record here",
				"];",
				""
			],
			"solutions": [
				"var myMusic = [\n  {\n    \"artist\": \"Billy Joel\",\n    \"title\": \"Piano Man\",\n    \"release_year\": 1973,\n    \"formats\": [ \n      \"CS\", \n      \"8T\", \n      \"LP\" ],\n    \"gold\": true\n  }, \n  {\n    \"artist\": \"ABBA\",\n    \"title\": \"Ring Ring\",\n    \"release_year\": 1973,\n    \"formats\": [ \n      \"CS\", \n      \"8T\", \n      \"LP\",\n    \"CD\",\n  ]\n  }\n];"
			],
			"tests": [
				"assert(Array.isArray(myMusic), 'message: <code>myMusic</code> should be an array');",
				"assert(myMusic.length > 1, 'message: <code>myMusic</code> should have at least two elements');",
				"assert(typeof myMusic[1] === 'object', 'message: <code>myMusic[1]</code> should be an object');",
				"assert(Object.keys(myMusic[1]).length > 3, 'message: <code>myMusic[1]</code> should have at least 4 properties');",
				"assert(myMusic[1].hasOwnProperty('artist') && typeof myMusic[1].artist === 'string', 'message: <code>myMusic[1]</code> should contain an <code>artist</code> property which is a string');",
				"assert(myMusic[1].hasOwnProperty('title') && typeof myMusic[1].title === 'string', 'message: <code>myMusic[1]</code> should  contain a <code>title</code> property which is a string');",
				"assert(myMusic[1].hasOwnProperty('release_year') && typeof myMusic[1].release_year === 'number', 'message: <code>myMusic[1]</code> should contain a <code>release_year</code> property which is a number');",
				"assert(myMusic[1].hasOwnProperty('formats') && Array.isArray(myMusic[1].formats), 'message: <code>myMusic[1]</code> should contain a <code>formats</code> property which is an array');",
				"assert(myMusic[1].formats.every(function(item) { return (typeof item === \"string\")}) && myMusic[1].formats.length > 1, 'message: <code>formats</code> should be an array of strings with at least two elements');"
			]
		},
		"complexObjects": C.En(0)
	},
	"nestedObjects": {
		"$meta": {
			"name": "Accessing Nested Objects",
			"icon": "code",
			"description": [
				"The sub-properties of objects can be accessed by chaining together the dot or bracket notation.",
				"Here is a nested object:",
				"<blockquote>var ourStorage = {<br>  \"desk\": {<br>    \"drawer\": \"stapler\"<br>  },<br>  \"cabinet\": {<br>    \"top drawer\": { <br>      \"folder1\": \"a file\",<br>      \"folder2\": \"secrets\"<br>    },<br>    \"bottom drawer\": \"soda\"<br>  }<br>};<br>ourStorage.cabinet[\"top drawer\"].folder2;  // \"secrets\"<br>ourStorage.desk.drawer; // \"stapler\"</blockquote>",
				"<hr>",
				"Access the <code>myStorage</code> object and assign the contents of the <code>glove box</code> property to the <code>gloveBoxContents</code> variable. Use bracket notation for properties with a space in their name."
			],
			"code": [
				"// Setup",
				"var myStorage = {",
				"  \"car\": {",
				"    \"inside\": {",
				"      \"glove box\": \"maps\",",
				"      \"passenger seat\": \"crumbs\"",
				"     },",
				"    \"outside\": {",
				"      \"trunk\": \"jack\"",
				"    }",
				"  }",
				"};",
				"",
				"// Only change code below this line",
				"",
				"var gloveBoxContents = \"\"; // Change this line",
				""
			],
			"solutions": [
				"var myStorage = {  \n  \"car\":{  \n    \"inside\":{  \n      \"glove box\":\"maps\",\n      \"passenger seat\":\"crumbs\"\n    },\n    \"outside\":{  \n      \"trunk\":\"jack\"\n    }\n  }\n};\nvar gloveBoxContents = myStorage.car.inside[\"glove box\"];"
			],
			"tests": [
				"assert(gloveBoxContents === \"maps\", 'message: <code>gloveBoxContents</code> should equal \"maps\"');",
				"assert(/=\\s*myStorage\\.car\\.inside\\[\\s*(\"|')glove box\\1\\s*\\]/g.test(code), 'message: Use dot and bracket notation to access <code>myStorage</code>');"
			]
		},
		"nestedObjects": C.En(0)
	},
	"nestedArrays": {
		"$meta": {
			"name": "Accessing Nested Arrays",
			"icon": "code",
			"description": [
				"As we have seen in earlier examples, objects can contain both nested objects and nested arrays. Similar to accessing nested objects, Array bracket notation can be chained to access nested arrays.",
				"Here is an example of how to access a nested array:",
				"<blockquote>var ourPets = [<br>  {<br>    animalType: \"cat\",<br>    names: [<br>      \"Meowzer\",<br>      \"Fluffy\",<br>      \"Kit-Cat\"<br>    ]<br>  },<br>  {<br>    animalType: \"dog\",<br>    names: [<br>      \"Spot\",<br>      \"Bowser\",<br>      \"Frankie\"<br>    ]<br>  }<br>];<br>ourPets[0].names[1]; // \"Fluffy\"<br>ourPets[1].names[0]; // \"Spot\"</blockquote>",
				"<hr>",
				"Retrieve the second tree from the variable <code>myPlants</code> using object dot and array bracket notation."
			],
			"code": [
				"// Setup",
				"var myPlants = [",
				"  { ",
				"    type: \"flowers\",",
				"    list: [",
				"      \"rose\",",
				"      \"tulip\",",
				"      \"dandelion\"",
				"    ]",
				"  },",
				"  {",
				"    type: \"trees\",",
				"    list: [",
				"      \"fir\",",
				"      \"pine\",",
				"      \"birch\"",
				"    ]",
				"  }  ",
				"];",
				"",
				"// Only change code below this line",
				"",
				"var secondTree = \"\"; // Change this line",
				""
			],
			"solutions": [
				"var myPlants = [\n  { \n    type: \"flowers\",\n    list: [\n      \"rose\",\n      \"tulip\",\n      \"dandelion\"\n    ]\n  },\n  {\n    type: \"trees\",\n    list: [\n      \"fir\",\n      \"pine\",\n      \"birch\"\n    ]\n  }  \n];\n\n// Only change code below this line\n\nvar secondTree = myPlants[1].list[1];"
			],
			"tests": [
				"assert(secondTree === \"pine\", 'message: <code>secondTree</code> should equal \"pine\"');",
				"assert(/=\\s*myPlants\\[1\\].list\\[1\\]/.test(code), 'message: Use dot and bracket notation to access <code>myPlants</code>');"
			]
		},
		"nestedArrays": C.En(0)
	},
	"recordCollection": {
		"$meta": {
			"name": "Record Collection",
			"icon": "code",
			"description": [
				"You are given a JSON object representing a part of your musical album collection. Each album has several properties and a unique id number as its key. Not all albums have complete information.",
				"Write a function which takes an album's <code>id</code> (like <code>2548</code>), a property <code>prop</code> (like <code>\"artist\"</code> or <code>\"tracks\"</code>), and a <code>value</code> (like <code>\"Addicted to Love\"</code>) to modify the data in this collection.",
				"If <code>prop</code> isn't <code>\"tracks\"</code> and <code>value</code> isn't empty (<code>\"\"</code>), update or set the <code>value</code> for that record album's property.",
				"Your function must always return the entire collection object.",
				"There are several rules for handling incomplete data:",
				"If <code>prop</code> is <code>\"tracks\"</code> but the album doesn't have a <code>\"tracks\"</code> property, create an empty array before adding the new value to the album's corresponding property.",
				"If <code>prop</code> is <code>\"tracks\"</code> and <code>value</code> isn't empty (<code>\"\"</code>), push the <code>value</code> onto the end of the album's existing <code>tracks</code> array.",
				"If <code>value</code> is empty (<code>\"\"</code>), delete the given <code>prop</code> property from the album.",
				"<strong>Hints</strong><br>Use <code>bracket notation</code> when <a href=\"accessing-objects-properties-with-variables\" target=\"_blank\">accessing object properties with variables</a>.",
				"Push is an array method you can read about on <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push\" target=\"_blank\">Mozilla Developer Network</a>.",
				"You may refer back to <a href=\"manipulating-complex-objects\" target=\"_blank\">Manipulating Complex Objects</a> Introducing JavaScript Object Notation (JSON) for a refresher."
			],
			"code": [
				"// Setup",
				"var collection = {",
				"    \"2548\": {",
				"      \"album\": \"Slippery When Wet\",",
				"      \"artist\": \"Bon Jovi\",",
				"      \"tracks\": [ ",
				"        \"Let It Rock\", ",
				"        \"You Give Love a Bad Name\" ",
				"      ]",
				"    },",
				"    \"2468\": {",
				"      \"album\": \"1999\",",
				"      \"artist\": \"Prince\",",
				"      \"tracks\": [ ",
				"        \"1999\", ",
				"        \"Little Red Corvette\" ",
				"      ]",
				"    },",
				"    \"1245\": {",
				"      \"artist\": \"Robert Palmer\",",
				"      \"tracks\": [ ]",
				"    },",
				"    \"5439\": {",
				"      \"album\": \"ABBA Gold\"",
				"    }",
				"};",
				"// Keep a copy of the collection for tests",
				"var collectionCopy = JSON.parse(JSON.stringify(collection));",
				"",
				"// Only change code below this line",
				"function updateRecords(id, prop, value) {",
				"  ",
				"  ",
				"  return collection;",
				"}",
				"",
				"// Alter values below to test your code",
				"updateRecords(5439, \"artist\", \"ABBA\");",
				""
			],
			"solutions": [
				"var collection = {\n    2548: {\n      album: \"Slippery When Wet\",\n      artist: \"Bon Jovi\",\n      tracks: [ \n        \"Let It Rock\", \n        \"You Give Love a Bad Name\" \n      ]\n    },\n    2468: {\n      album: \"1999\",\n      artist: \"Prince\",\n      tracks: [ \n        \"1999\", \n        \"Little Red Corvette\" \n      ]\n    },\n    1245: {\n      artist: \"Robert Palmer\",\n      tracks: [ ]\n    },\n    5439: {\n      album: \"ABBA Gold\"\n    }\n};\n// Keep a copy of the collection for tests\nvar collectionCopy = JSON.parse(JSON.stringify(collection));\n\n// Only change code below this line\nfunction updateRecords(id, prop, value) {\n  if(value === \"\") delete collection[id][prop];\n  else if(prop === \"tracks\") {\n    collection[id][prop] = collection[id][prop] || [];\n    collection[id][prop].push(value);\n  } else {\n    collection[id][prop] = value;\n  }\n  \n  return collection;\n}"
			],
			"tests": [
				"collection = collectionCopy; assert(updateRecords(5439, \"artist\", \"ABBA\")[5439][\"artist\"] === \"ABBA\", 'message: After <code>updateRecords(5439, \"artist\", \"ABBA\")</code>, <code>artist</code> should be <code>\"ABBA\"</code>');",
				"assert(updateRecords(5439, \"tracks\", \"Take a Chance on Me\")[5439][\"tracks\"].pop() === \"Take a Chance on Me\", 'message: After <code>updateRecords(5439, \"tracks\", \"Take a Chance on Me\")</code>, <code>tracks</code> should have <code>\"Take a Chance on Me\"</code> as the last element.');",
				"updateRecords(2548, \"artist\", \"\"); assert(!collection[2548].hasOwnProperty(\"artist\"), 'message: After <code>updateRecords(2548, \"artist\", \"\")</code>, <code>artist</code> should not be set');",
				"assert(updateRecords(1245, \"tracks\", \"Addicted to Love\")[1245][\"tracks\"].pop() === \"Addicted to Love\", 'message: After <code>updateRecords(1245, \"tracks\", \"Addicted to Love\")</code>, <code>tracks</code> should have <code>\"Addicted to Love\"</code> as the last element.');",
				"assert(updateRecords(2468, \"tracks\", \"Free\")[2468][\"tracks\"][0] === \"1999\", 'message: After <code>updateRecords(2468, \"tracks\", \"Free\")</code>, <code>tracks</code> should have <code>\"1999\"</code> as the first element.');",
				"updateRecords(2548, \"tracks\", \"\"); assert(!collection[2548].hasOwnProperty(\"tracks\"), 'message: After <code>updateRecords(2548, \"tracks\", \"\")</code>, <code>tracks</code> should not be set');",
				"assert(updateRecords(1245, \"album\", \"Riptide\")[1245][\"album\"] === \"Riptide\", 'message: After <code>updateRecords(1245, \"album\", \"Riptide\")</code>, <code>album</code> should be <code>\"Riptide\"</code>');"
			]
		},
		"recordCollection": C.En(0)
	},
	"whileLoops": {
		"$meta": {
			"name": "Iterate with JavaScript While Loops",
			"icon": "code",
			"description": [
				"You can run the same code multiple times by using a loop.",
				"Another type of JavaScript loop is called a \"<code>while loop</code>\", because it runs \"while\" a specified condition is true and stops once that condition is no longer true.",
				"<blockquote>var ourArray = [];<br>var i = 0;<br>while(i &#60; 5) {<br>  ourArray.push(i);<br>  i++;<br>}</blockquote>",
				"Let's try getting a while loop to work by pushing values to an array.",
				"<hr>",
				"Push the numbers 0 through 4 to <code>myArray</code> using a <code>while</code> loop."
			],
			"code": [
				"// Setup",
				"var myArray = [];",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var myArray = [];\nvar i = 0;\nwhile(i < 5) {\n  myArray.push(i);\n  i++;\n}"
			],
			"tests": [
				"assert(code.match(/while/g), 'message: You should be using a <code>while</code> loop for this.');",
				"assert.deepEqual(myArray, [0,1,2,3,4], 'message: <code>myArray</code> should equal <code>[0,1,2,3,4]</code>.');"
			]
		},
		"whileLoops": C.En(0)
	},
	"forLoops": {
		"$meta": {
			"name": "Iterate with JavaScript For Loops",
			"icon": "code",
			"description": [
				"You can run the same code multiple times by using a loop.",
				"The most common type of JavaScript loop is called a \"<code>for loop</code>\" because it runs \"for\" a specific number of times.",
				"For loops are declared with three optional expressions separated by semicolons:",
				"<code>for ([initialization]; [condition]; [final-expression])</code>",
				"The <code>initialization</code> statement is executed one time only before the loop starts. It is typically used to define and setup your loop variable.",
				"The <code>condition</code> statement is evaluated at the beginning of every loop iteration and will continue as long as it evaluates to <code>true</code>. When <code>condition</code> is <code>false</code> at the start of the iteration, the loop will stop executing. This means if <code>condition</code> starts as <code>false</code>, your loop will never execute.",
				"The <code>final-expression</code> is executed at the end of each loop iteration, prior to the next <code>condition</code> check and is usually used to increment or decrement your loop counter.",
				"In the following example we initialize with <code>i = 0</code> and iterate while our condition <code>i &#60; 5</code> is true. We'll increment <code>i</code> by <code>1</code> in each loop iteration with <code>i++</code> as our <code>final-expression</code>.",
				"<blockquote>var ourArray = [];<br>for (var i = 0; i &#60; 5; i++) {<br>  ourArray.push(i);<br>}</blockquote>",
				"<code>ourArray</code> will now contain <code>[0,1,2,3,4]</code>.",
				"<hr>",
				"Use a <code>for</code> loop to work to push the values 1 through 5 onto <code>myArray</code>."
			],
			"code": [
				"// Example",
				"var ourArray = [];",
				"",
				"for (var i = 0; i < 5; i++) {",
				"  ourArray.push(i);",
				"}",
				"",
				"// Setup",
				"var myArray = [];",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var ourArray = [];\nfor (var i = 0; i < 5; i++) {\n  ourArray.push(i);\n}\nvar myArray = [];\nfor (var i = 1; i < 6; i++) {\n  myArray.push(i);\n}"
			],
			"tests": [
				"assert(code.match(/for\\s*\\(/g).length > 1, 'message: You should be using a <code>for</code> loop for this.');",
				"assert.deepEqual(myArray, [1,2,3,4,5], 'message: <code>myArray</code> should equal <code>[1,2,3,4,5]</code>.');"
			]
		},
		"forLoops": C.En(0)
	},
	"oddNumbersIterate": {
		"$meta": {
			"name": "Iterate Odd Numbers With a For Loop",
			"icon": "code",
			"description": [
				"For loops don't have to iterate one at a time. By changing our <code>final-expression</code>, we can count by even numbers.",
				"We'll start at <code>i = 0</code> and loop while <code>i &#60; 10</code>. We'll increment <code>i</code> by 2 each loop with <code>i += 2</code>.",
				"<blockquote>var ourArray = [];<br>for (var i = 0; i &#60; 10; i += 2) {<br>  ourArray.push(i);<br>}</blockquote>",
				"<code>ourArray</code> will now contain <code>[0,2,4,6,8]</code>.",
				"Let's change our <code>initialization</code> so we can count by odd numbers.",
				"<hr>",
				"Push the odd numbers from 1 through 9 to <code>myArray</code> using a <code>for</code> loop."
			],
			"code": [
				"// Example",
				"var ourArray = [];",
				"",
				"for (var i = 0; i < 10; i += 2) {",
				"  ourArray.push(i);",
				"}",
				"",
				"// Setup",
				"var myArray = [];",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var ourArray = [];\nfor (var i = 0; i < 10; i += 2) {\n  ourArray.push(i);\n}\nvar myArray = [];\nfor (var i = 1; i < 10; i += 2) {\n  myArray.push(i);\n}"
			],
			"tests": [
				"assert(code.match(/for\\s*\\(/g).length > 1, 'message: You should be using a <code>for</code> loop for this.');",
				"assert.deepEqual(myArray, [1,3,5,7,9], 'message: <code>myArray</code> should equal <code>[1,3,5,7,9]</code>.');"
			]
		},
		"oddNumbersIterate": C.En(0)
	},
	"countBackwardLoops": {
		"$meta": {
			"name": "Count Backwards With a For Loop",
			"icon": "code",
			"description": [
				"A for loop can also count backwards, so long as we can define the right conditions.",
				"In order to count backwards by twos, we'll need to change our <code>initialization</code>, <code>condition</code>, and <code>final-expression</code>.",
				"We'll start at <code>i = 10</code> and loop while <code>i &#62; 0</code>. We'll decrement <code>i</code> by 2 each loop with <code>i -= 2</code>.",
				"<blockquote>var ourArray = [];<br>for (var i=10; i &#62; 0; i-=2) {<br>  ourArray.push(i);<br>}</blockquote>",
				"<code>ourArray</code> will now contain <code>[10,8,6,4,2]</code>.",
				"Let's change our <code>initialization</code> and <code>final-expression</code> so we can count backward by twos by odd numbers.",
				"<hr>",
				"Push the odd numbers from 9 through 1 to <code>myArray</code> using a <code>for</code> loop."
			],
			"code": [
				"// Example",
				"var ourArray = [];",
				"",
				"for (var i = 10; i > 0; i -= 2) {",
				"  ourArray.push(i);",
				"}",
				"",
				"// Setup",
				"var myArray = [];",
				"",
				"// Only change code below this line.",
				"",
				""
			],
			"solutions": [
				"var ourArray = [];\nfor (var i = 10; i > 0; i -= 2) {\n  ourArray.push(i);\n}\nvar myArray = [];\nfor (var i = 9; i > 0; i -= 2) {\n  myArray.push(i);\n}"
			],
			"tests": [
				"assert(code.match(/for\\s*\\(/g).length > 1, 'message: You should be using a <code>for</code> loop for this.');",
				"assert(code.match(/myArray.push/), 'message: You should be using the array method <code>push</code>.');",
				"assert.deepEqual(myArray, [9,7,5,3,1], 'message: <code>myArray</code> should equal <code>[9,7,5,3,1]</code>.');"
			]
		},
		"countBackwardLoops": C.En(0)
	},
	"iterateArrayLoop": {
		"$meta": {
			"name": "Iterate Through an Array with a For Loop",
			"icon": "code",
			"description": [
				"A common task in JavaScript is to iterate through the contents of an array. One way to do that is with a <code>for</code> loop. This code will output each element of the array <code>arr</code> to the console:",
				"<blockquote>var arr = [10,9,8,7,6];<br>for (var i = 0; i < arr.length; i++) {<br>   console.log(arr[i]);<br>}</blockquote>",
				"Remember that Arrays have zero-based numbering, which means the last index of the array is length - 1. Our <dfn>condition</dfn> for this loop is <code>i < arr.length</code>, which stops when <code>i</code> is at length - 1.",
				"<hr>",
				"Declare and initialize a variable <code>total</code> to <code>0</code>. Use a <code>for</code> loop to add the value of each element of the <code>myArr</code> array to <code>total</code>."
			],
			"code": [
				"// Example",
				"var ourArr = [ 9, 10, 11, 12];",
				"var ourTotal = 0;",
				"",
				"for (var i = 0; i < ourArr.length; i++) {",
				"  ourTotal += ourArr[i];",
				"}",
				"",
				"// Setup",
				"var myArr = [ 2, 3, 4, 5, 6];",
				"",
				"// Only change code below this line",
				"",
				""
			],
			"solutions": [
				"var ourArr = [ 9, 10, 11, 12];\nvar ourTotal = 0;\n\nfor (var i = 0; i < ourArr.length; i++) {\n  ourTotal += ourArr[i];\n}\n\nvar myArr = [ 2, 3, 4, 5, 6];\nvar total = 0;\n\nfor (var i = 0; i < myArr.length; i++) {\n  total += myArr[i];\n}"
			],
			"tests": [
				"assert(code.match(/var.*?total\\s*=\\s*0.*?;/), 'message: <code>total</code> should be declared and initialized to 0');",
				"assert(total === 20, 'message: <code>total</code> should equal 20');",
				"assert(code.match(/for\\s*\\(/g).length > 1 && code.match(/myArr\\s*\\[/), 'message: You should use a <code>for</code> loop to iterate through <code>myArr</code>');",
				"assert(!code.match(/total[\\s\\+\\-]*=\\s*(\\d(?!\\s*[;,])|[1-9])/g), 'message: Do not set <code>total</code> to 20 directly');"
			]
		},
		"iterateArrayLoop": C.En(0)
	},
	"nestingLoops": {
		"$meta": {
			"name": "Nesting For Loops",
			"icon": "code",
			"description": [
				"If you have a multi-dimensional array, you can use the same logic as the prior waypoint to loop through both the array and any sub-arrays. Here is an example:",
				"<blockquote>var arr = [<br>  [1,2], [3,4], [5,6]<br>];<br>for (var i=0; i &lt; arr.length; i++) {<br>  for (var j=0; j &lt; arr[i].length; j++) {<br>    console.log(arr[i][j]);<br>  }<br>}</blockquote>",
				"This outputs each sub-element in <code>arr</code> one at a time. Note that for the inner loop, we are checking the <code>.length</code> of <code>arr[i]</code>, since <code>arr[i]</code> is itself an array.",
				"<hr>",
				"Modify function <code>multiplyAll</code> so that it multiplies the <code>product</code> variable by each number in the sub-arrays of <code>arr</code>"
			],
			"code": [
				"function multiplyAll(arr) {",
				"  var product = 1;",
				"  // Only change code below this line",
				"  ",
				"  // Only change code above this line",
				"  return product;",
				"}",
				"",
				"// Modify values below to test your code",
				"multiplyAll([[1,2],[3,4],[5,6,7]]);",
				""
			],
			"solutions": [
				"function multiplyAll(arr) {\n  var product = 1;\n  for (var i = 0; i < arr.length; i++) {\n    for (var j = 0; j < arr[i].length; j++) {\n      product *= arr[i][j];\n    }\n  }\n  return product;\n}\n\nmultiplyAll([[1,2],[3,4],[5,6,7]]);"
			],
			"tests": [
				"assert(multiplyAll([[1],[2],[3]]) === 6, 'message: <code>multiplyAll([[1],[2],[3]])</code> should return <code>6</code>');",
				"assert(multiplyAll([[1,2],[3,4],[5,6,7]]) === 5040, 'message: <code>multiplyAll([[1,2],[3,4],[5,6,7]])</code> should return <code>5040</code>');",
				"assert(multiplyAll([[5,1],[0.2, 4, 0.5],[3, 9]]) === 54, 'message: <code>multiplyAll([[5,1],[0.2, 4, 0.5],[3, 9]])</code> should return <code>54</code>');"
			]
		},
		"nestingLoops": C.En(0)
	},
	"profileLookup": {
		"$meta": {
			"name": "Profile Lookup",
			"icon": "code",
			"description": [
				"We have an array of objects representing different people in our contacts lists.",
				"A <code>lookUpProfile</code> function that takes <code>name</code> and a property (<code>prop</code>) as arguments has been pre-written for you.",
				"The function should check if <code>name</code> is an actual contact's <code>firstName</code> and the given property (<code>prop</code>) is a property of that contact.",
				"If both are true, then return the \"value\" of that property.",
				"If <code>name</code> does not correspond to any contacts then return <code>\"No such contact\"</code>",
				"If <code>prop</code> does not correspond to any valid properties of a contact found to match <code>name</code> then return <code>\"No such property\"</code>"
			],
			"code": [
				"//Setup",
				"var contacts = [",
				"    {",
				"        \"firstName\": \"Akira\",",
				"        \"lastName\": \"Laine\",",
				"        \"number\": \"0543236543\",",
				"        \"likes\": [\"Pizza\", \"Coding\", \"Brownie Points\"]",
				"    },",
				"    {",
				"        \"firstName\": \"Harry\",",
				"        \"lastName\": \"Potter\",",
				"        \"number\": \"0994372684\",",
				"        \"likes\": [\"Hogwarts\", \"Magic\", \"Hagrid\"]",
				"    },",
				"    {",
				"        \"firstName\": \"Sherlock\",",
				"        \"lastName\": \"Holmes\",",
				"        \"number\": \"0487345643\",",
				"        \"likes\": [\"Intriguing Cases\", \"Violin\"]",
				"    },",
				"    {",
				"        \"firstName\": \"Kristian\",",
				"        \"lastName\": \"Vos\",",
				"        \"number\": \"unknown\",",
				"        \"likes\": [\"Javascript\", \"Gaming\", \"Foxes\"]",
				"    }",
				"];",
				"",
				"",
				"function lookUpProfile(name, prop){",
				"// Only change code below this line",
				"",
				"// Only change code above this line",
				"}",
				"",
				"// Change these values to test your function",
				"lookUpProfile(\"Akira\", \"likes\");"
			],
			"solutions": [
				"var contacts = [\n    {\n        \"firstName\": \"Akira\",\n        \"lastName\": \"Laine\",\n        \"number\": \"0543236543\",\n        \"likes\": [\"Pizza\", \"Coding\", \"Brownie Points\"]\n    },\n    {\n        \"firstName\": \"Harry\",\n        \"lastName\": \"Potter\",\n        \"number\": \"0994372684\",\n        \"likes\": [\"Hogwarts\", \"Magic\", \"Hagrid\"]\n    },\n    {\n        \"firstName\": \"Sherlock\",\n        \"lastName\": \"Holmes\",\n        \"number\": \"0487345643\",\n        \"likes\": [\"Intriguing Cases\", \"Violin\"]\n    },\n    {\n        \"firstName\": \"Kristian\",\n        \"lastName\": \"Vos\",\n        \"number\": \"unknown\",\n        \"likes\": [\"Javascript\", \"Gaming\", \"Foxes\"]\n    },\n];\n\n\n//Write your function in between these comments\nfunction lookUpProfile(name, prop){\n    for(var i in contacts){\n      if(contacts[i].firstName === name) {\n        return contacts[i][prop] || \"No such property\";\n      }\n    }\n   return \"No such contact\";\n}\n//Write your function in between these comments\n\nlookUpProfile(\"Akira\", \"likes\");"
			],
			"tests": [
				"assert(lookUpProfile('Kristian','lastName') === \"Vos\", 'message: <code>\"Kristian\", \"lastName\"</code> should return <code>\"Vos\"</code>');",
				"assert.deepEqual(lookUpProfile(\"Sherlock\", \"likes\"), [\"Intriguing Cases\", \"Violin\"], 'message: <code>\"Sherlock\", \"likes\"</code> should return <code>[\"Intriguing Cases\", \"Violin\"]</code>');",
				"assert(typeof lookUpProfile(\"Harry\", \"likes\") === \"object\", 'message: <code>\"Harry\",\"likes\"</code> should return an array');",
				"assert(lookUpProfile(\"Bob\", \"number\") === \"No such contact\", 'message: <code>\"Bob\", \"number\"</code> should return \"No such contact\"');",
				"assert(lookUpProfile(\"Bob\", \"potato\") === \"No such contact\", 'message: <code>\"Bob\", \"potato\"</code> should return \"No such contact\"');",
				"assert(lookUpProfile(\"Akira\", \"address\") === \"No such property\", 'message: <code>\"Akira\", \"address\"</code> should return \"No such property\"');"
			]
		},
		"profileLookup": C.En(0)
	},
	"randomFractions": {
		"$meta": {
			"name": "Generate Random Fractions with JavaScript",
			"icon": "code",
			"description": [
				"Random numbers are useful for creating random behavior.",
				"JavaScript has a <code>Math.random()</code> function that generates a random decimal number between <code>0</code> (inclusive) and not quite up to <code>1</code> (exclusive). Thus <code>Math.random()</code> can return a <code>0</code> but never quite return a <code>1</code>",
				"<strong>Note</strong><br>Like <a href='storing-values-with-the-assignment-operator' target='_blank'>Storing Values with the Equal Operator</a>, all function calls will be resolved before the <code>return</code> executes, so we can <code>return</code> the value of the <code>Math.random()</code> function.",
				"<hr>",
				"Change <code>randomFraction</code> to return a random number instead of returning <code>0</code>."
			],
			"code": [
				"function randomFraction() {",
				"",
				"  // Only change code below this line.",
				"",
				"  return 0;",
				"",
				"  // Only change code above this line.",
				"}"
			],
			"solutions": [
				"function randomFraction() {\n  return Math.random();\n}"
			],
			"tests": [
				"assert(typeof randomFraction() === \"number\", 'message: <code>randomFraction</code> should return a random number.');",
				"assert((randomFraction()+''). match(/\\./g), 'message: The number returned by <code>randomFraction</code> should be a decimal.');",
				"assert(code.match(/Math\\.random/g).length >= 0, 'message: You should be using <code>Math.random</code> to generate the random decimal number.');"
			]
		},
		"randomFractions": C.En(0)
	},
	"randomIntegers": {
		"$meta": {
			"name": "Generate Random Whole Numbers with JavaScript",
			"icon": "code",
			"description": [
				"It's great that we can generate random decimal numbers, but it's even more useful if we use it to generate random whole numbers.",
				"<ol><li>Use <code>Math.random()</code> to generate a random decimal.</li><li>Multiply that random decimal by <code>20</code>.</li><li>Use another function, <code>Math.floor()</code> to round the number down to its nearest whole number.</li></ol>",
				"Remember that <code>Math.random()</code> can never quite return a <code>1</code> and, because we're rounding down, it's impossible to actually get <code>20</code>. This technique will give us a whole number between <code>0</code> and <code>19</code>.",
				"Putting everything together, this is what our code looks like:",
				"<code>Math.floor(Math.random() * 20);</code>",
				"We are calling <code>Math.random()</code>, multiplying the result by 20, then passing the value to <code>Math.floor()</code> function to round the value down to the nearest whole number.",
				"<hr>",
				"Use this technique to generate and return a random whole number between <code>0</code> and <code>9</code>."
			],
			"code": [
				"var randomNumberBetween0and19 = Math.floor(Math.random() * 20);",
				"",
				"function randomWholeNum() {",
				"",
				"  // Only change code below this line.",
				"",
				"  return Math.random();",
				"}"
			],
			"solutions": [
				"var randomNumberBetween0and19 = Math.floor(Math.random() * 20);\nfunction randomWholeNum() {\n  return Math.floor(Math.random() * 10);\n}"
			],
			"tests": [
				"assert(typeof randomWholeNum() === \"number\" && (function(){var r = randomWholeNum();return Math.floor(r) === r;})(), 'message: The result of <code>randomWholeNum</code> should be a whole number.');",
				"assert(code.match(/Math.random/g).length > 1, 'message: You should be using <code>Math.random</code> to generate a random number.');",
				"assert(code.match(/\\s*?Math.random\\s*?\\(\\s*?\\)\\s*?\\*\\s*?10[\\D]\\s*?/g) || code.match(/\\s*?10\\s*?\\*\\s*?Math.random\\s*?\\(\\s*?\\)\\s*?/g), 'message: You should have multiplied the result of <code>Math.random</code> by 10 to make it a number that is between zero and nine.');",
				"assert(code.match(/Math.floor/g).length > 1, 'message: You should use <code>Math.floor</code> to remove the decimal part of the number.');"
			]
		},
		"randomIntegers": C.En(0)
	},
	"randomIntegersRange": {
		"$meta": {
			"name": "Generate Random Whole Numbers within a Range",
			"icon": "code",
			"description": [
				"Instead of generating a random number between zero and a given number like we did before, we can generate a random number that falls within a range of two specific numbers.",
				"To do this, we'll define a minimum number <code>min</code> and a maximum number <code>max</code>.",
				"Here's the formula we'll use. Take a moment to read it and try to understand what this code is doing:",
				"<code>Math.floor(Math.random() * (max - min + 1)) + min</code>",
				"<hr>",
				"Create a function called <code>randomRange</code> that takes a range <code>myMin</code> and <code>myMax</code> and returns a random number that's greater than or equal to <code>myMin</code>, and is less than or equal to <code>myMax</code>, inclusive."
			],
			"code": [
				"// Example",
				"function ourRandomRange(ourMin, ourMax) {",
				"",
				"  return Math.floor(Math.random() * (ourMax - ourMin + 1)) + ourMin;",
				"}",
				"",
				"ourRandomRange(1, 9);",
				"",
				"// Only change code below this line.",
				"",
				"function randomRange(myMin, myMax) {",
				"",
				"  return 0; // Change this line",
				"",
				"}",
				"",
				"// Change these values to test your function",
				"var myRandom = randomRange(5, 15);"
			],
			"solutions": [
				"function randomRange(myMin, myMax) {\n  return Math.floor(Math.random() * (myMax - myMin + 1)) + myMin;\n}"
			],
			"tests": [
				"assert(calcMin === 5, 'message: The lowest random number that can be generated by <code>randomRange</code> should be equal to your minimum number, <code>myMin</code>.');",
				"assert(calcMax === 15, 'message: The highest random number that can be generated by <code>randomRange</code> should be equal to your maximum number, <code>myMax</code>.');",
				"assert(randomRange(0,1) % 1 === 0 , 'message: The random number generated by <code>randomRange</code> should be an integer, not a decimal.');",
				"assert((function(){if(code.match(/myMax/g).length > 1 && code.match(/myMin/g).length > 2 && code.match(/Math.floor/g) && code.match(/Math.random/g)){return true;}else{return false;}})(), 'message: <code>randomRange</code> should use both <code>myMax</code> and <code>myMin</code>, and return a random number in your range.');"
			]
		},
		"randomIntegersRange": C.En(0)
	},
	"parseIntFunction": {
		"$meta": {
			"name": "Use the parseInt Function",
			"icon": "code",
			"description": [
				"The <code>parseInt()</code> function parses a string and returns an integer. Here's an example:",
				"<code>var a = parseInt(\"007\");</code>",
				"The above function converts the string \"007\" to an integer 7. If the first character in the string can't be converted into a number, then it returns <code>NaN</code>.",
				"<hr>",
				"Use <code>parseInt()</code> in the <code>convertToInteger</code> function so it converts the input string <code>str</code> into an integer, and returns it."
			],
			"code": [
				"function convertToInteger(str) {",
				"  ",
				"}",
				"",
				"convertToInteger(\"56\");"
			],
			"solutions": [],
			"tests": [
				"assert(/parseInt/g.test(code), 'message: <code>convertToInteger</code> should use the <code>parseInt()</code> function');",
				"assert(typeof(convertToInteger(\"56\")) === \"number\", 'message: <code>convertToInteger(\"56\")</code> should return a number');",
				"assert(convertToInteger(\"56\") === 56, 'message: <code>convertToInteger(\"56\")</code> should return 56');",
				"assert(convertToInteger(\"77\") === 77, 'message: <code>convertToInteger(\"77\")</code> should return 77');",
				"assert.isNaN(convertToInteger(\"JamesBond\"), 'message: <code>convertToInteger(\"JamesBond\")</code> should return NaN');"
			]
		},
		"parseIntFunction": C.En(0)
	},
	"parseIntRadix": {
		"$meta": {
			"name": "Use the parseInt Function with a Radix",
			"icon": "code",
			"description": [
				"The <code>parseInt()</code> function parses a string and returns an integer. It takes a second argument for the radix, which specifies the base of the number in the string. The radix can be an integer between 2 and 36.",
				"The function call looks like:",
				"<code>parseInt(string, radix);</code>",
				"And here's an example:",
				"<code>var a = parseInt(\"11\", 2);</code>",
				"The radix variable says that \"11\" is in the binary system, or base 2. This example converts the string \"11\" to an integer 3.",
				"<hr>",
				"Use <code>parseInt()</code> in the <code>convertToInteger</code> function so it converts a binary number to an integer and returns it."
			],
			"code": [
				"function convertToInteger(str) {",
				"  ",
				"}",
				"",
				"convertToInteger(\"10011\");"
			],
			"solutions": [],
			"tests": [
				"assert(/parseInt/g.test(code), 'message: <code>convertToInteger</code> should use the <code>parseInt()</code> function');",
				"assert(typeof(convertToInteger(\"10011\")) === \"number\", 'message: <code>convertToInteger(\"10011\")</code> should return a number');",
				"assert(convertToInteger(\"10011\") === 19, 'message: <code>convertToInteger(\"10011\")</code> should return 19');",
				"assert(convertToInteger(\"111001\") === 57, 'message: <code>convertToInteger(\"111001\")</code> should return 57');",
				"assert.isNaN(convertToInteger(\"JamesBond\"), 'message: <code>convertToInteger(\"JamesBond\")</code> should return NaN');"
			]
		},
		"parseIntRadix": C.En(0)
	},
	"ternaryOperator": {
		"$meta": {
			"name": "Use the Conditional (Ternary) Operator",
			"icon": "code",
			"description": [
				"The <dfn>conditional operator</dfn>, also called the <dfn>ternary operator</dfn>, can be used as a one line if-else expression.",
				"The syntax is:",
				"<code>condition ? statement-if-true : statement-if-false;</code>",
				"The following function uses an if-else statement to check a condition:",
				"<blockquote>function findGreater(a, b) {<br>  if(a > b) {<br>    return \"a is greater\";<br>  }<br>  else {<br>    return \"b is greater\";<br>  }<br>}</blockquote>",
				"This can be re-written using the <code>conditional operator</code>:",
				"<blockquote>function findGreater(a, b) {<br>  return a > b ? \"a is greater\" : \"b is greater\";<br>}</blockquote>",
				"<hr>",
				"Use the <code>conditional operator</code> in the <code>checkEqual</code> function to check if two numbers are equal or not. The function should return either true or false."
			],
			"code": [
				"function checkEqual(a, b) {",
				"  ",
				"}",
				"",
				"checkEqual(1, 2);"
			],
			"solutions": [],
			"tests": [
				"assert(/.+?\\s*?\\?\\s*?.+?\\s*?:\\s*?.+?/gi.test(code), 'message: <code>checkEqual</code> should use the <code>conditional operator</code>');",
				"assert(checkEqual(1, 2) === false, 'message: <code>checkEqual(1, 2)</code> should return false');",
				"assert(checkEqual(1, 1) === true, 'message: <code>checkEqual(1, 1)</code> should return true');",
				"assert(checkEqual(1, -1) === false, 'message: <code>checkEqual(1, -1)</code> should return false');"
			]
		},
		"ternaryOperator": C.En(0)
	},
	"multipleTernaryOperators": {
		"$meta": {
			"name": "Use Multiple Conditional (Ternary) Operators",
			"icon": "code",
			"description": [
				"In the previous challenge, you used a single <code>conditional operator</code>. You can also chain them together to check for multiple conditions.",
				"The following function uses if, else if, and else statements to check multiple conditions:",
				"<blockquote>function findGreaterOrEqual(a, b) {<br>  if(a === b) {<br>    return \"a and b are equal\";<br>  }<br>  else if(a > b) {<br>    return \"a is greater\";<br>  }<br>  else {<br>    return \"b is greater\";<br>  }<br>}</blockquote>",
				"The above function can be re-written using multiple <code>conditional operators</code>:",
				"<blockquote>function findGreaterOrEqual(a, b) {<br>  return (a === b) ? \"a and b are equal\" : (a > b) ? \"a is greater\" : \"b is greater\";<br>}</blockquote>",
				"<hr>",
				"Use multiple <code>conditional operators</code> in the <code>checkSign</code> function to check if a number is positive, negative or zero."
			],
			"code": [
				"function checkSign(num) {",
				"  ",
				"}",
				"",
				"checkSign(10);"
			],
			"solutions": [],
			"tests": [
				"assert(/.+?\\s*?\\?\\s*?.+?\\s*?:\\s*?.+?\\s*?\\?\\s*?.+?\\s*?:\\s*?.+?/gi.test(code), 'message: <code>checkSign</code> should use multiple <code>conditional operators</code>');",
				"assert(checkSign(10) === 'positive', 'message: <code>checkSign(10)</code> should return \"positive\". Note that capitalization matters');",
				"assert(checkSign(-12) === 'negative', 'message: <code>checkSign(-12)</code> should return \"negative\". Note that capitalization matters');",
				"assert(checkSign(0) === 'zero', 'message: <code>checkSign(0)</code> should return \"zero\". Note that capitalization matters');"
			]
		},
		"multipleTernaryOperators": C.En(0)
	}
}