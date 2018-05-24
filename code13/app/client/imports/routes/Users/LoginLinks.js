import PropTypes from 'prop-types'
import React from 'react'
import QLink from '../QLink'

const LoginLinks = props => {
  const { showLogin, showSignup, showForgot } = props

  const loginText = showLogin === true ? 'Already registered? Log In.' : showLogin
  const signupText = showSignup === true ? 'Not a member? Sign up!' : showSignup
  const forgotText = showForgot === true ? 'Forgot password?' : showSignup

  return (
    <div style={{ textAlign: 'center' }}>
      {showLogin && (
        <p>
          <QLink to="/login">{loginText}</QLink>
        </p>
      )}
      {showSignup && (
        <p>
          <QLink to="/signup">{signupText}</QLink>
        </p>
      )}
      {showForgot && (
        <p>
          <QLink to="/forgot-password">{forgotText}</QLink>
        </p>
      )}
    </div>
  )
}

LoginLinks.propTypes = {
  showLogin: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  showSignup: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  showForgot: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
}

export default LoginLinks
