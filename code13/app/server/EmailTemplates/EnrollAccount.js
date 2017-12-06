import ActionTemplate from './ActionTemplate'

export default function EnrollAccount(user, url) {
  const title = 'Welcome to My Game Builder!'
  const buttonText = 'Activate Account'
  const previewHeader = 'Activate Account'
  const text = `Hi ${user.profile.name},<br><br>Activate your account by clicking the button below.`
  return ActionTemplate(url, title, buttonText, text, previewHeader)
}
