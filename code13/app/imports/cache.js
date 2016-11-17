const prefix = "/api/"

const API_SERVERS = [
  // probably it's better to fill up this array while caching APIS - so we will and up with all servers that accesses API
  Meteor.absoluteUrl()
]

export default {
  API_SERVERS: API_SERVERS,
  cleanHeader: "nocache",
  cacheServerHeader: "x-cache-server",
  store: {},
  // find a way to automate this - AssetUrlGenerator?
  routes: {
    common: (id, user, name) => {
      return [
        `api/test`,
        `asset/${id}`,
        `asset/full/${user}/${name}`,
        `asset/json/${id}`,

        `asset/thumbnail/png/${id}`,
        `asset/thumbnail/png/${user}/${name}`,
        `asset/id/${user}/${name}`
      ]
    },
    graphic: (id, user, name) => {
      return [
        `asset/png/${id}`,
        `asset/png/${user}/${name}`,
        `asset/fullgraphic/${user}/${name}`,
        `asset/tileset-info/${id}`,
        `asset/tileset/${id}`,
        `asset/tileset/${user}/${name}`
      ]
    },
    actor: (id, user, name) => {
      return [
        `asset/actor/${user}/${name}`,
        `asset/fullactor/${user}/${name}`
      ]
    },
    avatar: (id, user, name) => {
      return [
        `user/${id}/avatar`
      ]
    },
    tutorial: (id, user, name) => {
      return [
        `asset/tutorial/${id}`
      ]
    },
    code: (id, user, name) => {
      return [
        `asset/code/${id}`,
        `asset/code/${id}/${name}`,// this could break things
        `asset/code/${id}/${user}/${name}`,
        `asset/code/bundle/${id}`,
        `asset/code/bundle/u/${user}/${name}`
      ]
    },
    music: (id, user, name) => {
      return [
        `asset/music/${id}/music.mp3`
      ]
    },
    sound: (id, user, name) => {
      return [
        `asset/sound/${id}/sound.mp3`,
        `asset/sound/name/${name}`
      ]
    }
  },
  invalidateAsset: function(assetData){
    const id = assetData._id
    const user = assetData.dn_ownerName
    const name = assetData.name

    console.log(`Clearing cache for: ${user}:${name} (${id})`)

    API_SERVERS.forEach( (server) => {
      const forSource = url => {
        Meteor.http.call("HEAD", server + url, {"nocache": "true"}, () => {
          console.log("cleared:", server + url)
          // dummy fn - to force Meteor use async version of the http request
        })
      }
      this.routes.common(id, user, name).forEach(forSource)
      this.routes[assetData.kind] && this.routes[assetData.kind](id, user, name).forEach(forSource)
    })
  }
}
