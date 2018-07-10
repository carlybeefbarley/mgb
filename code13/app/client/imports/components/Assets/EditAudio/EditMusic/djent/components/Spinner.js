import React, { Component } from 'react'

const Spinner = props => (
  <div>
    <div className="spinner spinner--large" />
    {!props.subtext ? null : <div className="spinner__subtext">{props.subtext}</div>}
  </div>
)

export default Spinner
