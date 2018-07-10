// The various rules for links are encoded in this file so that they
// can be centrally managed.

// Note that react-router (as of 2.4.x for sure) does not have a way to generate
// routes in a DRY manner. This issue is tracked in the React-Router issues list
// at https://github.com/reactjs/react-router/issues/1840

// For now, in order to centralize route management, this set of utilities
// should be used when using/mainpulating routes/paths/queries, and
// this is also where all paths, queries and any path/query naming conventions
// should be documented.

// TODO: The rest of the code should migrate away from direct route construction
// ..i.e. get rid of any <Link to="/foo/"+foo._id> mess

// MAINTAIN: Keep paths here in sync with imports/routes/index.js

import _ from 'lodash'

let _appRouter = undefined // Set in setKnownRoutes()

var _queryParamMap = {
  // APP queryGroup queries are defined at the App.js/Nav.js level and should be preserved when going to a new page within MGB
  _fp: { qGroup: 'APP', symbolName: 'app_flexPanel' },
  _xed: { qGroup: 'APP', symbolName: 'app_experimentalEditors' },
}

const urlMaker = {
  disableQueryParamPrefix: '-', // Character used for disabling effects of a query param. Use by _np, _fp etc

  isQueryEnabled(queryValue) {
    return !!(queryValue && !queryValue.startsWith(urlMaker.disableQueryParamPrefix))
  },

  enableQuery(queryValue, defaultValue) {
    // Empty -> Enabled(default)
    if (!queryValue) return defaultValue

    // Disabled -> Enabled
    if (!urlMaker.isQueryEnabled(queryValue)) return queryValue.slice(urlMaker.disableQueryParamPrefix.length)

    // Enabled -> (same)
    return queryValue
  },

  disableQuery(queryValue, defaultValue) {
    // Enabled -> Disabled (ie. disableQueryParamPrefix+queryValue or null if it is the default)
    if (urlMaker.isQueryEnabled(queryValue))
      return queryValue === defaultValue ? null : urlMaker.disableQueryParamPrefix + queryValue

    // Empty -> same
    // Disabled -> same
    return queryValue
  },

  setKnownRoutes(router) {
    _appRouter = router
  },

  /** Returns only the query objects with keys that match this queryGroup
   * @param query   An Object of querykey: queryvalue pairs
   * @param qGroup  A string with the queryGroup name, for example "APP". See _queryParamMap for definitions
   */
  getQueryParamsMatchingQueryGroup(query, qGroup, excludedSymbolName) {
    return _.pickBy(
      query,
      (val, key) =>
        _queryParamMap[key] &&
        _queryParamMap[key].qGroup === qGroup &&
        (!excludedSymbolName || excludedSymbolName !== _queryParamMap[key].symbolName),
    )
  },

  /** This is used to preserve any cross-app query params
   *
   * @param {string} query  The initial Query String
   * @param {string} [excludedSymbolName=null]  Optional - if present, then those entries from _queryParamMap will be excluded. The main case for this is the NavPanel auto-close
   * @returns {array}
   */
  getCrossAppQueryParams(query, excludedSymbolName = null) {
    return this.getQueryParamsMatchingQueryGroup(query, 'APP', excludedSymbolName)
  },

  /** This function checks that the query parameter is known (by symbolName) and returns the short form */
  queryParams(symbolName) {
    const queryParamKey = _.findKey(_queryParamMap, ['symbolName', symbolName])
    if (!queryParamKey) {
      console.trace(`Unknown queryParam "${symbolName}" passed to urlMaker`)
      return symbolName
    }
    return queryParamKey
  },

  // and other arguments for params
  pathTo(stableName) {
    if (stableName === '/') return '/' // Just handle this specially so we don't complicate parsing with this special case

    // TODO: Validate this is a known path by looking in _appRouter for paths other than *
    //  ...<CODE CODE CODE>...

    let argPos = 1

    let parts = stableName.split('/')
    let mangledParts = parts.map(p => {
      return p[0] === ':' ? arguments[argPos++] : p
    })

    if (argPos !== arguments.length)
      console.trace(
        `Mismatched number of arguments for pathTo(${stableName}). Expected ${argPos}, was provided ${arguments.length}`,
      )

    return mangledParts.join('/')
  },
}

export default urlMaker
