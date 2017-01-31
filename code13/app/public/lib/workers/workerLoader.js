this.onmessage = function(e){
  console.log("got message!", e.data)
  importScripts.apply(null, e.data)
}
