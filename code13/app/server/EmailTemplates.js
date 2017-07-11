import { Accounts } from 'meteor/accounts-base'
import { mjml2html } from 'mjml'

Accounts.emailTemplates.siteName = 'MyGameBuilder.com'

// Accounts.emailTemplates.from = "MyGameBuilder Accounts Admin <accounts@devlapse.com>";
// Accounts.emailTemplates.from = "MyGameBuilder Accounts Admin <no-reply@mycodebuilder.com>";
Accounts.emailTemplates.from = 'MyGameBuilder Accounts Admin <no-reply@mygamebuilder.com>'
// Accounts.emailTemplates.from = "MyGameBuilder Accounts Admin <guntis@mightyfingers.com>";

Accounts.emailTemplates.resetPassword.subject = function(user) {
  return 'Reset your email'
}

Accounts.emailTemplates.resetPassword.html = function(user, url) {
  url = url.replace('#/', '')
  console.log('----------', url)
  // console.log(url)
  // console.log( mjml2html('<mjml><mj-body><mj-container><mj-section><mj-column><mj-text>To reset your email, please click the link below:</mj-text></mj-column></mj-section></mj-container></mj-body></mjml>'))

  // return "To reset your email, please click the link below:"
  //  + url;

  // return mjml2html('<mjml><mj-body><mj-container><mj-section><mj-column><mj-text>To reset your email, please click the link below:</mj-text></mj-column></mj-section></mj-container></mj-body></mjml>')
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

Accounts.emailTemplates.verifyEmail.html = function(user, url) {
  return mjml2html(`
    <mjml>
      <mj-body>
        <mj-container background-color="#f8f3ea">
          <mj-section background-color="#fff">
            <mj-column width="100%">
              <mj-text>Thank you for your registration. Please <a href="' + url + '">verify your e-mail</a>!</mj-text>
            </mj-column>
          </mj-section>
        </mj-container>
      </mj-body>
    </mjml>
  `).html
}
