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
import AssetShowDeletedSelector from '../../components/Assets/AssetShowDeletedSelector.js';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';


@reactMixin.decorate(History)
@reactMixin.decorate(ReactMeteorData)
export default class UserAssetListRoute extends Component {

  static propTypes = {
    params: PropTypes.object,       // .id Maybe absent if route is /assets
    user: PropTypes.object,         // Maybe absent if route is /assets
    currUser: PropTypes.object,     // Currently Logged in user
    ownsProfile: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      showDeletedFlag: false,
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
        handle = Meteor.subscribe("assets.auth", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName, this.state.showDeletedFlag);
      } else {
        handle = Meteor.subscribe("assets.public", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName, this.state.showDeletedFlag);
      }
    }
    else
    {
      // route did not include a user-id for scope
      handle = Meteor.subscribe("assets.public", -1, this.state.selectedAssetKinds, this.state.searchName, this.state.showDeletedFlag);
    }

    return {
      assets: Azzets.find({}, {sort: {updatedAt: -1}}).fetch(), // TODO: don't bring down content2 field
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

  handleChangeShowDeletedFlag(newValue)
  {
    this.setState( {showDeletedFlag: newValue})
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

        <div className="twelve wide column">
          <div className="ui secondary compact borderless fitted menu">
            <div className="ui item grey">Search:</div>
            <div className="ui item">
              <AssetKindsSelector kindsActive={this.state.selectedAssetKinds} handleToggleKindCallback={this.handleToggleKind.bind(this)} />
              &nbsp;
              <div className="ui icon buttons">
                <AssetShowDeletedSelector showDeletedFlag={this.state.showDeletedFlag} handleChangeFlag={this.handleChangeShowDeletedFlag.bind(this)} />
              </div>
            </div>
            <div className="right item">
              <div className="ui action input">
                <input type="text" placeholder="Search asset name" ref="searchNameInput"></input>
                <button className="ui icon button" onClick={this.handleSearchGo.bind(this)}>
                  <i className="search icon"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="three wide right floated column">
            <AssetCreateNew
              handleCreateAssetClick={this.handleCreateAssetClickFromComponent.bind(this)}/>
        </div>

        <div className="sixteen wide column">
          {this.data.loading ?
            <div><Spinner /></div>
          :
            <AssetList assets={assets} currUser={this.props.currUser} />}
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
