import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'


// get code by id - tmp used for es6 import
RestApi.addRoute('asset/code/:id', {authRequired: false}, {
  get: function () {
    let content;
    let asset = Azzets.findOne(this.urlParams.id)
    if(!asset){
      return {
        statusCode: 404,
        body: {} // body required to correctly show 404 not found header
      }
    }
    content = asset.content2.src;

    if(content) {
      return {
        statusCode: 200,
        headers: {'Content-Type': "text/plain", 'file-name': asset.name},
        body: content
      };
    }
    else {
      return {
        statusCode: 404,
        body: {}
      }
    }
  }
})

// used in codeEdit - import X from '/codeName' - referrer is added automatically
RestApi.addRoute('asset/code/:referrer/:name', {authRequired: false}, {
  get: function(){
    const referrer = Azzets.findOne(this.urlParams.referrer);
    const asset = Azzets.findOne({owner: referrer.owner, name: this.urlParams.name})
    if(asset) {
      return {
        statusCode: 200,
        // filename header - idea is to tell e.g. ajax asset name
        headers: {'Content-Type': "text/plain", 'file-name': asset.name},
        body: asset.content2.src || "\n" // without new line API returns JSON
      };
    }
    else{
      return {statusCode: 404,body: {}} // body required to correctly show 404 not found header}
    }
  }
})

// TODO: permission check ?
// TODO: cleanup - make single function that requires assets ? DRY?
// used in codeEdit - import X from '/owner/codeName' - referrer is added automatically
RestApi.addRoute('asset/code/:referrer/:owner/:name', {authRequired: false}, {
  get: function(){

    // referrer is not used here
    /*
    const owner = Users.findOne({"profile.name": this.urlParams.owner})
    if(!owner){
      return {statusCode: 404}
    }
    */

    const asset = Azzets.findOne({dn_ownerName: this.urlParams.owner, name: this.urlParams.name})

    if(asset) {
      return {
        statusCode: 200,
        headers: {'Content-Type': "text/plain", 'file-name': asset.name},
        body: asset.content2.src
      };
    }
    else{
      return {statusCode: 404}
    }
  }
})

const _makeBundle = asset => {
  if (!asset)
    return { statusCode: 404 }
  
  const { bundle } = asset.content2
  // reload page after 1 second - as bundle may be on the way to the server
  const extraMessage = !!bundle ? '' : `
No bundle yet. Please run the source file in the code to generate/refresh the bundle
<script>window.setTimeout(function(){window.location.reload()}, 1000)</script>
`
    
  const content = `<!DOCTYPE html>
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
  return {
    statusCode: 200,
    headers: {'Content-Type': "text/html", 'file-name': asset.name},
    body: content
  }
}

RestApi.addRoute('asset/code/bundle/:id', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)
    return _makeBundle(asset)
  }
})


RestApi.addRoute('asset/code/bundle/u/:username/:codename', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne( { dn_ownerName: this.urlParams.username, name: this.urlParams.codename } )
    return _makeBundle(asset)
  }
})
