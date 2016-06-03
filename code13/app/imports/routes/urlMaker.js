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


let _appRouter = undefined
var _queryParamMap = {
  "app_flexPanel": { queryParam: "_fp", type: "APP" } // APP type are defined at the App.js/Nav.js level and should be preserved when going to a new page within MGB
}

export default urlMaker = {
  
  setKnownRoutes(router) 
  {
    _appRouter = router
  },

  /** This function checks that the query parameter is known */  
  queryParams: function(symbolName) {
    const queryParamObj = _queryParamMap[symbolName]
    if (!queryParamObj)
    {
      console.trace(`Unknown queryParam "${symbolName}" passed to urlMaker`)
      return symbolName
    }
    return queryParamObj.queryParam
  },
  
  pathTo: function(stableName)  // and other arguments for params
  {
    if (stableName === "/")
      return "/"    // Just handle this specially so we don't complicate parsing with this special case

    // TODO: Validate this is a known path by looking in _appRouter for paths other than *
    //  ...<CODE CODE CODE>...
    
    
    let argPos = 1
    
    let parts = stableName.split("/")
    let mangledParts = parts.map(p => { return p[0] === ":" ? arguments[argPos++] : p})
    
    if (argPos !== arguments.length)
      console.trace(`Mismatched number of arguments for pathTo(${stableName}). Expected ${argPos}, was provided ${arguments.length}`)
    
    return mangledParts.join("/")
  }  
  
}
