/**
 * creates single file html document from asset code bundle
 * @param asset - code asset
 * @param origin - host with protocol and optionally port (e.g. http://example.com:8081) where to redirect user if bundle is not present (while using CDN host by default will be cloudfront host) {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin}
 * @returns {String}
 */
const makeCodeBundle = (asset, origin) => {
  origin = origin || ''
  const { bundle } = asset.content2
  // reload page after 1 second - as bundle may be on the way to the server
  // target _blank - because we are loading iframe from CDN + we don't want to allow game navigate to another page leaving MGB
  const extraMessage = bundle
    ? ''
    : `
<h2 style='padding:0.5em'>The distribution bundle for this game has not yet been created</h2>
<p style='padding-left:2em'>You can create the bundle using the 'run code full screen' or 'bundle code' tools in the <a href='${origin}/u/${asset.dn_ownerName}/asset/${asset._id}' target="_blank" >MGB Code Editor</a>.</p>
<script>window.setTimeout(function(){window.location.reload()}, 2000)</script>
`
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<link rel="shortcut icon" href="/images/favicons/favicon.ico">
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
export default makeCodeBundle
