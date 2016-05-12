// This is used by EditCode.js to host and support sandboxed 
// evaluation/run of scripts in an iFrame

// for the embdedded console renderer, use
//    <script type='text/javascript' src='/console-log-viewer.js#console_at_bottom=true'></script>

export const iframeScripts = {
  phaser244: 
`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MyGameBuilder Sandbox Frame</title>
  <style type="text/css">
    body {
      margin: 0;
    }
  </style>
</head>

<body>
  <div id="game"></div>
  <script type="text/javascript">

    var _isAlive = false;


var mgbHostMessageContext = { msgSource: null, msgOrigin: null };


    window.onload = function() {
      _isAlive = true;
      
      
      // Wrap the console functions so we can pass the info to parent window
      var consoleMethodNames = ["log", "debug", "info", "warn", "error"]  // trace? dir? 
      var consoleOrigFns = {}
      for (var i = 0; i < consoleMethodNames.length; i++)
      {
        var name = consoleMethodNames[i]
        if (console[name])
        {
          consoleOrigFns[name] = {
            "name": name,
            "origFn": console[name]
          }
          !function() {
            var stableName = name;
            console[stableName] = function(msg) {
              consoleOrigFns[stableName].origFn.apply(this, arguments);            
              window.parent.postMessage( { 
                args: Array.prototype.slice.call(arguments), 
                mgbCmd: "mgbConsoleMsg", 
                consoleFn: stableName,
                timestamp: new Date(),
                line: undefined
              }, "*");
            }
          }()
        }
      }
    
      originalWindowOnerror = window.onerror
      window.onerror = function(message, url, lineNumber) {
      window.parent.postMessage( { 
        args: [message], 
        mgbCmd: "mgbConsoleMsg", 
        consoleFn: 'windowOnerror',
        timestamp: new Date(),
        line: lineNumber
      }, "*");
        if (originalWindowOnerror) 
          return originalWindowOnerror(message, url, lineNumber);
        else 
          return false;
      }
    

      function loadScript(url, callback)
      {
          // Adding the script tag to the head to load it
          var head = document.getElementsByTagName('head')[0];
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = url;

          // Then bind the event to the callback function.
          // There are several events for cross browser compatibility, so do both
          script.onreadystatechange = callback;
          script.onload = callback;
          script.onerror = function(err) {
          console.warn("Could not load script: " + url);
          }

          // Fire the loading
          head.appendChild(script);
      }


      function loadScriptFromText(srcText, callback)
      {
          // Adding the script tag to the head to load it
          var head = document.getElementsByTagName('head')[0];
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.text = srcText;

          if (callback)
          {
            // Then bind the event to the callback function.
            // There are several events for cross browser compatibility, so do both
            script.onreadystatechange = callback;
            script.onload = callback;
          }
          script.onerror = function(err) {
          console.warn("Could not load script from provided SourceText");
          }

          // Fire the loading
          head.appendChild(script);
      }



      window.addEventListener('message', function (e) {
        var mainWindow = e.source;
        if (e.data === 'ping')
        {
          mainWindow.postMessage(_isAlive, e.origin);
        }
        else
        {
          mgbHostMessageContext.msgSource = e.source;
          mgbHostMessageContext.msgOrigin = e.origin;
          try {
            loadScript(e.data.gameEngineScriptToPreload, function() {         
              //  eval(e.data.codeToRun);  // NOT using eval since we can't get good window.onError information from it           
              loadScriptFromText(e.data.codeToRun);
            })
          } catch (err) {
          console.error("Could not load and execute script: " + err);
          }
        }
      });
    
    }

  </script>

</body>
</html>`
}