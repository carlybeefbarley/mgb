import React, { PropTypes } from 'react'
import QLink from '../QLink'

const LoginLinks = props => {
  const { showLogin, showSignup, showForgot } = props

  return (
    <div style={{ textAlign: 'center' }}>
      {showLogin && (
        <p>
          <QLink to="/login">Already have an account? Log In.</QLink>
        </p>
      )}
      {showSignup && (
        <p>
          <QLink to="/signup">Not a member? Sign up!</QLink>
        </p>
      )}
      {showForgot && (
        <p>
          <QLink to="/forgot-password">Forgot password?</QLink>
        </p>
      )}
    </div>
  )
}

LoginLinks.propTypes = {
  showLogin: PropTypes.bool,
  showSignup: PropTypes.bool,
  showForgot: PropTypes.bool,
}

export default LoginLinks
