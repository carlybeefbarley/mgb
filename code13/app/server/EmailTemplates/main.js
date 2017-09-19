import { Accounts } from 'meteor/accounts-base'
import ResetPassword from './ResetPassword'
import VerifyEmail from './VerifyEmail'

Accounts.emailTemplates.siteName = 'MyGameBuilder.com'

Accounts.emailTemplates.from = 'MyGameBuilder Accounts Admin <no-reply@mygamebuilder.com>'

Accounts.emailTemplates.resetPassword = {
  subject(user) {
    return 'Reset your email'
  },

  html(user, url) {
    url = url.replace('#/', '')
    return ResetPassword(url)
  },
}

Accounts.emailTemplates.verifyEmail = {
  subject(user) {
    return 'Verify your email'
  },

  html(user, url) {
    url = url.replace('#/', '')
    return VerifyEmail(url)
  },
}
