import ActionTemplate from './ActionTemplate'

export default function ResetPassword(url) {
  const title = 'Reset Password'
  const buttonText = 'Reset Password'
  const previewHeader = 'Reset your password'
  const text = 'To reset your password, please click the button below'
  return ActionTemplate(url, title, buttonText, text, previewHeader)
}
