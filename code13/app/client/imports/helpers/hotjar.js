import { isUserSuperAdmin } from '/imports/schemas/roles'

const isLocalHostOrStaging = () => /^localhost|staging/.test(location.hostname)

const Hotjar = (action, codeSnippet, currUser = Meteor.user()) => {
  // console.log('superAdmin', isUserSuperAdmin(currUser))

  // don't send hotjar heatmap if superadmin or localhost
  if (!isUserSuperAdmin(currUser) && !isLocalHostOrStaging()) {
    if (typeof window.hj === 'function') {
      window.hj(action, codeSnippet)
    }
  }
}

export default Hotjar

export const InitHotjar = (currUser = Meteor.user()) => {
  if (!isUserSuperAdmin(currUser) && !isLocalHostOrStaging()) {
    // h._hjSettings={hjid:446876,hjsv:5,hjdebug:true};
    ;(function(h, o, t, j, a, r) {
      h.hj =
        h.hj ||
        function() {
          ;(h.hj.q = h.hj.q || []).push(arguments)
        }
      h._hjSettings = { hjid: 446876, hjsv: 5 }
      a = o.getElementsByTagName('head')[0]
      r = o.createElement('script')
      r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=')
  }
}
