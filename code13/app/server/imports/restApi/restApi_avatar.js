import { RestApi } from './restApi'

// This lets the client easily get user avatar.. e.g http://localhost:3000/api/user/raMDZ9atjHABXu5KG/avatar
RestApi.addRoute('user/:id/avatar', {authRequired: false}, {
  get: function () {
    var user = Meteor.users.findOne(this.urlParams.id)
    if (user && user.profile.avatar)
    {
      return {
        statusCode: 302,    // FOUND (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
        headers: {
          'Location': user.profile.avatar
          // 'cache-control': 'max-age=30'
          // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
        },
        body: {}
      }
    }
    else {
      return {
        statusCode: 404                
      }
    }
  }
})