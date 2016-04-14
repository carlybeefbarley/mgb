


export default JsonDocsFinder = {
  // Note 'this' will be 'DocsPhaser'
  
  _jsonDocCache: {},
  
  _makeDocUrl: function(req)
  {
    console.log(req.frameworkName)

    if (req.frameworkName === "phaser")
    {
      let ver = req.frameworkVersion || "2.4.6"
      let file = this._getClassNameFromOneName(req.symbol)
      return `/${req.frameworkName}/${ver}/docgen/output/${file}.json`
    }
    
    if (req.frameworkName === "lodash")
    {
      return '/lodash.jsdoc.json'
    }
    return null;
  },
  
  
  /** 
   * @param request      {object} like { frameworkName:     "requiredString", 
   *                                     ?frameworkVersion: "optionalString", 
   *                                     symbolType:         "method|variable|class", 
   *                                     symbol:             "stringOfTheSymbol"
   *                                   }
   * @param callbackFn   {function} that will take params (originalRequest, result).. 
   *                          originalRequest is the requestPassed in (but with the additional param _urlString which is the URL of the doc used)
   *                          result is { error: errorInfo, data: resultsFromJsonFile)
   * 
   * @returns <nothing>   There will ALWAYS be a callback, sometimes sync (error or cached), sometimes async (needed network)
   * 
   */
  getApiDocsAsync: function(request, callbackFn) {
    request._urlString = this._makeDocUrl(request)
    if (!request.symbol || request.symbol.indexOf(".") === -1 || request._urlString === null)
    {
      this._processApiDocRequest(request, null, callbackFn)
      return             // Call us with undefined/null or a symbol without a . and you get nothing back (SYNC)
    }
    
    // Handle sync case from cache
    if (this._jsonDocCache.hasOwnProperty(request._urlString))
    {
      request._urlLoadedFromCache = true;
      this._processApiDocRequest(request, this._jsonDocCache[request._urlString], callbackFn)   // we can do this synchronously
      return // (SYNC)
    }

    request._urlLoadedFromCache = false;

    let jqXHR = $.ajax({
      url: request._urlString,
      type: 'get',
      dataType: 'json',
      cache: true,
      async: true
    });    
    
    jqXHR.done((data) => {
          // Cache it
          this._jsonDocCache[request._urlString] = data
          this._processApiDocRequest(request, this._jsonDocCache[request._urlString], callbackFn)   // Callback is async in this case
        })
    
    jqXHR.fail((error) => {
      this._processApiDocRequest(request, null, callbackFn)   // Callback is async in this case. Null data parameter means pass on fail
    })
    
    return // There will be an ASYNC callback. Note that we don't expose the promise (intentionally)
  },
  
  
  /** 
   * get the relevant info
   */
  _getDesiredDocInfo: function(originalRequest, docInfoFromJsonFile)
  {
    if (!docInfoFromJsonFile)
      return null               // We're not psychics!
      
    // so now we care about the following parts of originalRequest:
    //    symbolType: "method|variable|class", 
    //    symbol:     "stringOfTheSymbol" as a longname including the class
    // ..and we should have the correct JSON api doc to look at to get this
    let retval = null
    let symbolElementArray = originalRequest.symbol.split(".")
    originalRequest._leafOfSymbol = _.last(symbolElementArray)
    
    
    if (originalRequest.symbolType === 'method')
    {
      // We don't have a clear definition (yet) from tern that this is a NEW invocation on a constructor,
      // so there's some mild hackery here to make things mostly work before coming back and handling the
      // constructor vs invocation issue more robustly.. For now we do this, which at least works for Phaser 
      // since it mostly constructed of big-ass top-level classes
            
      let methodIsClassConstructorInvocation = 
          (originalRequest.frameworkName === "phaser" && symbolElementArray.length === 2)

      if (methodIsClassConstructorInvocation)
      {
        // we want to return class. It doesn't have 'returns' so renderer must be aware of that.
        if (docInfoFromJsonFile.class)
        {
          retval = docInfoFromJsonFile.class
          retval.__typeIs = "classConstructor"
        }
      }
      else
      {        
        if (originalRequest.frameworkName === "lodash")
        {
          let c_ = docInfoFromJsonFile.classes[0]
          retval =  _.find(c_.functions, {'name' : originalRequest._leafOfSymbol})
          if (retval)
            retval.__typeIs = "functionOrMethod"        
        }
        
        if (originalRequest.frameworkName === "phaser")
        {
          if (docInfoFromJsonFile.methods && docInfoFromJsonFile.methods.public) 
          {
            retval =  _.find(docInfoFromJsonFile.methods.public, {'name' : originalRequest._leafOfSymbol})
            if (retval)
              retval.__typeIs = "functionOrMethod"
          }
        }
      }
    }
    return retval
  },
  
  _processApiDocRequest: function(originalRequest, docInfoFromJsonFile, originalCallbackFn)
  {
    if (docInfoFromJsonFile === null)
      originalCallbackFn(originalRequest, {error: `API Doc not found at ${originalRequest._urlString} for request ${originalRequest.symbol}`})
    else
    {
      
      var desiredDocInfo = this._getDesiredDocInfo(originalRequest, docInfoFromJsonFile)
      originalCallbackFn(originalRequest, { data: desiredDocInfo} )
    }
  },
  
  
  
  _getClassNameFromOneName: function(longName)
  {
    if (!longName || longName.length === 0)
      return null;
    
    var nArray = longName.split(".")
    if (nArray.length > 1)
      return nArray[0] + "." + nArray[1]
    else
      return null
  }
  
  
}