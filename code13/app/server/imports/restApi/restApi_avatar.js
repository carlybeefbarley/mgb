import { err404, RestApi } from './restApi'
import SpecialGlobals from '/imports/SpecialGlobals'

// For avatars, there is a common case where we want the avatar from just the name,
// So we provide a way to get this:

// with user _id  just use   //api/user/kvBq9PB987zuKiENQ/avatar
// with username  just use   //api/user/dgolds/avatar

// Note that this is unlike the other api paths of /api/user/:id/ since it is
// for the very common use case of avatar from username

const userIdSelector = id => (id[0] === '@' ? { username: id.slice(1) } : { _id: id })

// This lets the client easily get user avatar.. e.g http://localhost:3000/api/user/raMDZ9atjHABXu5KG/avatar
RestApi.addRoute(
  'user/:id/avatar',
  { authRequired: false },
  {
    get() {
      const user = Meteor.users.findOne(userIdSelector(this.urlParams.id))
      if (user && user.profile.avatar) {
        const maxAge = SpecialGlobals.avatar.validFor
        return {
          statusCode: 302, // FOUND (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
          headers: {
            Location: user.profile.avatar,
            'cache-control': `public, max-age=${maxAge}, s-maxage=${maxAge}, must-revalidate`,
          },
          body: {},
        }
      } else return err404
    },
  },
)

// This lets the client easily get user avatar.. e.g http://localhost:3000/api/user/raMDZ9atjHABXu5KG/avatar
RestApi.addRoute(
  'user/:id/avatar/:expires',
  { authRequired: false },
  {
    get() {
      const user = Meteor.users.findOne(userIdSelector(this.urlParams.id))
      if (user && user.profile.avatar) {
        let avatarLink
        const expires = parseInt(this.urlParams.expires, 10)
        // is local link?
        if (
          user.profile.avatar.startsWith('/') &&
          !user.profile.avatar.startsWith('//') &&
          expires &&
          !isNaN(expires)
        ) {
          const now = Date.now()
          // this will be timestamp rounded to seconds
          const nextUpdate = now - now % (expires * 1000)
          // this will force cache on our api
          avatarLink = user.profile.avatar + `?hash=${nextUpdate}&expires=${expires}`
        } else {
          avatarLink = user.profile.avatar
        }

        const maxAge = expires && !isNaN(expires) ? expires : 0
        return {
          statusCode: 302, // FOUND (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
          headers: {
            Location: avatarLink,
            'cache-control': `public, max-age=${maxAge}, s-maxage=${maxAge}, must-revalidate`,
            // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
          },
          body: {},
        }
      } else return err404
    },
  },
)
