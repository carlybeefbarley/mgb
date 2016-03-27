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
  <script src="//cdn.jsdelivr.net/phaser/2.4.4/phaser.min.js"></script>
</head>

<body>
  <div id="game"></div>

  <script type="text/javascript">

    var _isAlive = false;

    window.onload = function() {
      _isAlive = true;
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
            eval(e.data);
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