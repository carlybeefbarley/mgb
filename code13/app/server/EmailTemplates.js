import {Accounts} from 'meteor/accounts-base';

Accounts.emailTemplates.siteName = "MyGameBuilder.com";

Accounts.emailTemplates.from = "MyGameBuilder Accounts Admin <accounts@devlapse.com>";

Accounts.emailTemplates.resetPassword.subject = function (user) {
  return "Reset your email";
};
Accounts.emailTemplates.resetPassword.text = function (user, url) {
  url = url.replace('#/', '')
  return "To reset your email, please click the link below:"
   + url;
};
