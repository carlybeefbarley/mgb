import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'


// get music by id
RestApi.addRoute('asset/actor/:user/:name', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne({
      kind: "actor",
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      isDeleted: false
    })

    if (!asset || !asset.content2) {
      return {
        statusCode: 404,
        body: {} // body is required to correctly set 404 header
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/json'
      },
      // TODO: cache
      body: asset.content2
    }
  }
})
