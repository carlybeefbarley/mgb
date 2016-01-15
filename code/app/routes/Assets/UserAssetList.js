import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';
import AssetList from '../../components/Assets/AssetList';
import Spinner from '../../components/Spinner/Spinner';
import {handleForms} from '../../components/Forms/FormDecorator';
import {History} from 'react-router';
import Helmet from 'react-helmet';
import UserItem from '../../components/Users/UserItem.js';
import AssetCreateNew from '../../components/Assets/AssetCreateNew.js';

@reactMixin.decorate(History)
@reactMixin.decorate(ReactMeteorData)
export default class UserAssetListRoute extends Component {

  static propTypes = {
    params: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  }

  constructor(props) {
    super(props);
  }

  getMeteorData() {
    let handle

    //Subscribe to assets labeled isPrivate?
    if (this.props.ownsProfile) {
      handle = Meteor.subscribe("assets.auth", this.props.params.id);
    } else {
      handle = Meteor.subscribe("assets.public");
    }

    return {
      assets: Azzets.find({}, {sort: {createdAt: -1}}).fetch(),
      loading: !handle.ready()
    };
  }

  render() {
    let assets = this.data.assets;    //list of assets provided via getMeteorData()

    const {user, ownsProfile} = this.props;
    const {_id, createdAt} = user;
    const {name, avatar} = user.profile;

    return (
      <div className="ui grid">

        <Helmet
          title="Assets"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <div className="ten wide column">
          <div className="ui large header">{name}&rsquo;s Assets
            <div className="ui sub header">{assets.length} Assets</div>
          </div>
        </div>

        <div className="six wide column">
          <UserItem
              name={name}
              avatar={avatar}
              createdAt={createdAt}
              _id={_id} />
        </div>

        <div className="ten wide column">

          {this.props.ownsProfile ?
            <AssetCreateNew
              handleCreateAssetClick={this.handleCreateAssetClickFromComponent.bind(this)}/>
          : null }
        </div>

        <div className="sixteen wide column">
          {assets ?
            <AssetList assets={assets} canEdit={ownsProfile} />
          : null }
        </div>
      </div>

    );
  }

  handleCreateAssetClickFromComponent(assetKindKey, assetName) {
    Meteor.call('Azzets.create', {
      name: assetName,
      kind: assetKindKey,
      text: "",
      thumbnail: "",
      content2: {},

      isCompleted: false,
      isDeleted: false,
      isPrivate: true,
      teamId: ''
    }, (error, result) => {
      if (error) {
          alert("cannot create asset because: " + error.reason);
      } else {
        this.history.pushState(null, `/assetEdit/${result}`)
      }
    });
  }


}
