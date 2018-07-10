import ActionTemplate from './ActionTemplate'

export default function VerifyEmail(url) {
  const title = 'Verify Email'
  const buttonText = 'Verify Email'
  const previewHeader = 'Verify your email'
  const text = 'To verify your email, please click the button below'
  return ActionTemplate(url, title, buttonText, text, previewHeader)
}
