import _ from 'lodash';
import React from 'react';
import QLink from '/client/imports/routes/QLink';

export default class CreateAssetLinkButton extends React.Component {

  render() {
    return (
      <div className="ui green compact tiny inverted menu">
        <QLink to="/assets/create" className="item">
          Create New Asset
          </QLink>
      </div>
    )
  }
}