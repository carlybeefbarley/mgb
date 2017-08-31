import { Accounts } from 'meteor/accounts-base'
import { mjml2html } from 'mjml'

Accounts.emailTemplates.siteName = 'MyGameBuilder.com'

Accounts.emailTemplates.from = 'MyGameBuilder Accounts Admin <no-reply@mygamebuilder.com>'

Accounts.emailTemplates.resetPassword.subject = function(user) {
  return 'Reset your email'
}

Accounts.emailTemplates.resetPassword.html = function(user, url) {
  url = url.replace('#/', '')
  return mjml2html(
    `
      <mjml>
        <mj-body>
          <mj-container background-color="#f8f3ea">
            <mj-section background-color="#fff">
              <mj-column width="100%">
                <mj-text>To reset your email, please click the link below: ` +
      url +
      `</mj-text>
              </mj-column>
            </mj-section>
          </mj-container>
        </mj-body>
      </mjml>
    `,
  ).html
}

Accounts.emailTemplates.verifyEmail.subject = function(user) {
  return 'Verify your email'
}

Accounts.emailTemplates.verifyEmail.html = function(user, url) {
  url = url.replace('#/', '')
  return mjml2html(
    `
    <mjml>
      <mj-body>
        <mj-container background-color="#f8f3ea">
          <mj-section background-color="#fff">
            <mj-column width="100%">
              <mj-text>Thank you for your registration. Please click on link to verify your email: ` +
      url +
      `</mj-text>
            </mj-column>
          </mj-section>
        </mj-container>
      </mj-body>
    </mjml>
  `,
  ).html
}
