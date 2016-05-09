// This is used by EditCode.js to host and support sandboxed 
// evaluation/run of scripts in an iFrame

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


<script type='text/javascript' src='/console-log-viewer.js#console_at_bottom=true'></script>

</head>

<body>
  <div id="game"></div>
  <script type="text/javascript">

    var _isAlive = false;


var mgbHostMessageContext = { msgSource: null, msgOrigin: null };


    window.onload = function() {
      _isAlive = true;
      
      // (function() {
      //   var exLog = console.log;
      //   console.log = function(msg) {
      //     exLog.apply(this, arguments);
      //     if (!!mgbHostMessageContext.msgSource)
      //       mgbHostMessageContext.msgSource.postMessage(arguments, mgbHostMessageContext.msgOrigin);
      //   }
      // })()

    

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