import _ from 'lodash'

/**
 * 
 * @param {String} this is expectied to be an assetName. See validate.js for expected values
 * @returns {String} a valid JavaScript variable name derived from the input, or 'importedVar' as a last resort
 */
const makeValidJsVarName = str =>
  _.chain(str)
    .deburr() // simplify diacriticals
    .trimStart("0123456789.- ()!/~;'<>@&") // no leading digits or weird punctuation in variables
    .words(/[a-zA-Z0-9_]+/g) // extract regions (alphanumeric 'words' ) that can be used in variableNames
    .camelCase() // camelCase it (an alternative is join('_') for snakeCase)
    .value() || 'importedVar' // return it, or 'importedVar' if there was nothing left

// For sanity check when making changes...
// const _tests = [ '123My.cool.lib7', 'abc123', '123abc', '!/s.aBc(12)3', '(!abc1(23', ';11abc123', '\'_foo_M<__>x_@_y@z __&']
// _.each(_tests, t => console.log(`'${t}' -> '${makeValidJsVarName(t)}'`))

export default makeValidJsVarName
