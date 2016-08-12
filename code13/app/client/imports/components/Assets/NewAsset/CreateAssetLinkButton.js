import React from 'react'
import QLink from '/client/imports/routes/QLink'

export default class CreateAssetLinkButton extends React.Component {

  render() {
    return (
      <div className="ui green tiny button">
        <QLink to="/assets/create" className="item" elOverride="div">
          Create New Asset
        </QLink>
      </div>
    )
  }
}