export default asset => {

  const { bundle } = asset.content2
  // reload page after 1 second - as bundle may be on the way to the server
  const extraMessage = !!bundle ? '' : `
<h2 style='padding:0.5em'>The distribution bundle for this game has not yet been created</h2>
<p style='padding-left:2em'>You can create the bundle using the 'run code full screen' or 'bundle code' tools in the <a href='/u/${asset.dn_ownerName}/asset/${asset._id}' target="_top" >MGB Code Editor</a>.</p>
<script>window.setTimeout(function(){window.location.reload()}, 2000)</script>
`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${asset.name}</title>
<style>html, body{padding: 0; margin: 0; width: 100%; height: 100%}</style>
</head>
<body><script type="text/javascript">
//<!--
${bundle}
//-->
</script>${extraMessage}</body>
</html>
`

}
