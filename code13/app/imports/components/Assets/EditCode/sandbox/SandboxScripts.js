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
</head>

<body>
  <div id="game"></div>

  <script type="text/javascript">

    var _isAlive = false;

    window.onload = function() {
      _isAlive = true;
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
        try {
          loadScript(e.data.gameEngineScriptToPreload, function() {
            eval(e.data.codeToRun);
          })
        } catch (err) {
          console.log(err);
          //  This could probably be displayed in a modal of some kind in the main page
          mainWindow.postMessage(err.message, e.origin);
        }
      }

    });

  </script>

</body>
</html>`
}