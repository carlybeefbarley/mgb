import React, { PropTypes } from 'react'
import QLink from '../QLink'

const LoginLinks = props => {
  const { showLogin, showSignup, showForgot } = props
  const sty = { marginRight: '2em', textDecoration: 'underline' }

  return (
    <p style={{marginTop: '1em'}} >
      <small>
      { showLogin  && <QLink style={sty} to='/login'>Already have an account? Log In</QLink> }
      { showSignup && <QLink style={sty} to='/signup'>Need an Account? Sign up now</QLink> }
      { showForgot && <QLink style={sty} to='/forgot-password'>Forgot password?</QLink> }
      </small>
    </p>
  )
}

LoginLinks.propTypes = {
  showLogin: PropTypes.bool,
  showSignup: PropTypes.bool,
  showForgot: PropTypes.bool
}

export default LoginLinks