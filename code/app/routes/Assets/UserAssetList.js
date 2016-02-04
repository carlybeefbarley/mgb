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
    params: PropTypes.object,       // .id Maybe absent if route is /assets
    user: PropTypes.object,         // Maybe absent if route is /assets
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  }

  constructor(props) {
    super(props);
  }

  getMeteorData() {
    let handle

    if (this.props.params.id) {
      // Route included a user-id for scope
      //Subscribe to assets labeled isPrivate?
      if (this.props.ownsProfile) {
        handle = Meteor.subscribe("assets.auth", this.props.params.id);
      } else {
        handle = Meteor.subscribe("assets.public");
      }
    }
    else
    {
      // route did not include a user-id for scope
      handle = Meteor.subscribe("assets.public");
    }

    return {
      assets: Azzets.find({}, {sort: {createdAt: -1}}).fetch(), // TODO: don't bring down content2 field
      loading: !handle.ready()
    };
  }

  render() {
    let assets = this.data.assets;    //list of assets provided via getMeteorData()

    const {user, ownsProfile} = this.props;

    if (user) {
      var {_id, createdAt} = user;
      var {name, avatar} = user.profile;
    }
    else {
      // XXX ???
    }
    return (
      <div className="ui grid">

        <Helmet
          title="Assets"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <div className="ten wide column">
          <div className="ui large header">{ user ? (name + "'s Assets") : ("Public assets") }
            <div className="ui sub header">{assets.length} Assets</div>
          </div>
        </div>

        <div className="six wide column">
          {user ? <UserItem
              name={name}
              avatar={avatar ? avatar : null}
              createdAt={createdAt}
              _id={_id} />
            :
            null
          }
        </div>

        <div className="ten wide column">

          {user && this.props.ownsProfile ?
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
