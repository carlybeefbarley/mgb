

export const fetchAssetByUri = uri => {
  var promise = new Promise( function (resolve, reject) {
    var client = new XMLHttpRequest()
    client.open('GET', uri)
    client.send()
    client.onload = function () {
      if (this.status >= 200 && this.status < 300) 
        resolve(this.response)  // Performs the function "resolve" when this.status is equal to 2xx
      else
        reject(this.statusText) // Performs the function "reject" when this.status is different than 2xx
    }
    client.onerror = function () { reject(this.statusText) }
  })
  return promise
}

