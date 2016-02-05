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
import AssetKindsSelector from '../../components/Assets/AssetKindsSelector.js';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';


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
    this.state = {
      selectedAssetKinds: _.map(AssetKindKeys, (k) => { return k } ),
      searchName:         ""
    }
  }

  getMeteorData() {
    let handle

    if (this.props.params.id) {
      // Route included a user-id for scope
      //Subscribe to assets labeled isPrivate?
      if (this.props.ownsProfile) {
        handle = Meteor.subscribe("assets.auth", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName);
      } else {
        handle = Meteor.subscribe("assets.public", this.state.selectedAssetKinds, this.state.searchName);
      }
    }
    else
    {
      // route did not include a user-id for scope
      handle = Meteor.subscribe("assets.public", this.state.selectedAssetKinds, this.state.searchName);
    }

    return {
      assets: Azzets.find({}, {sort: {createdAt: -1}}).fetch(), // TODO: don't bring down content2 field
      loading: !handle.ready()
    };
  }

  handleToggleKind(k, altKey) // k is the string for the AssetKindsKey to toggle existence of in the array
  {
    let s = this.state.selectedAssetKinds
    if (altKey)
      this.setState({ selectedAssetKinds: [k] } )
    else
      this.setState({ selectedAssetKinds: _.indexOf(s,k)==-1?_.union(s,[k]):_.without(s,k) })
  }

  handleSearchGo(event)
  {
    this.setState( {searchName: this.refs.searchNameInput.value } )
  }

  render() {
    let assets = this.data.assets;    //list of assets provided via getMeteorData()

    const {user, ownsProfile} = this.props;

    if (user) {
      var {_id, createdAt} = user;
      var {name, avatar} = user.profile;
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

        <div className="eleven wide column">
          <div className="ui compact menu">
            <div className="ui item grey label">Search:</div>
            <AssetKindsSelector kindsActive={this.state.selectedAssetKinds} handleToggleKindCallback={this.handleToggleKind.bind(this)} />
            <div className="right item">
              <div className="ui action input">
                <input type="text" placeholder="Search name..." ref="searchNameInput"></input>
                <div className="ui button" onClick={this.handleSearchGo.bind(this)}>Go</div>
              </div>
            </div>
          </div>
        </div>

        <div className="five wide column">
            <AssetCreateNew
              handleCreateAssetClick={this.handleCreateAssetClickFromComponent.bind(this)}/>
        </div>

        <div className="sixteen wide column">
          {this.data.loading ?
            <div><Spinner /></div>
          :
            <AssetList assets={assets} canEdit={ownsProfile} />}
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
