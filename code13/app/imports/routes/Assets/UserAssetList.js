import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';
import AssetList from '../../components/Assets/AssetList';
import AssetCreateNew from '../../components/Assets/AssetCreateNew.js';
import AssetKindsSelector from '../../components/Assets/AssetKindsSelector.js';
import AssetShowDeletedSelector from '../../components/Assets/AssetShowDeletedSelector.js';
import AssetShowStableSelector from '../../components/Assets/AssetShowStableSelector.js';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';
import AssetListSortBy from '../../components/Assets/AssetListSortBy';

import Spinner from '../../components/Spinner/Spinner';
import {handleForms} from '../../components/Forms/FormDecorator';
import {History} from 'react-router';
import Helmet from 'react-helmet';
import UserItem from '../../components/Users/UserItem.js';


export default  UserAssetListRoute = React.createClass({
  mixins: [ReactMeteorData, History],

  // static propTypes = {
  //   params: PropTypes.object,       // .id Maybe absent if route is /assets
  //   user: PropTypes.object,         // Maybe absent if route is /assets
  //   currUser: PropTypes.object,     // Currently Logged in user
  //   ownsProfile: PropTypes.bool
  // }

  getInitialState: function() {
    return {
      showDeletedFlag: false,
      showStableFlag: false,
      selectedAssetKinds: _.map(AssetKindKeys, (k) => { return k } ),
      searchName: "",
      chosenSortBy: "edited"
    }
  },

  getMeteorData() {
    let handle

    if (this.props.params.id) {
      // Route included a user-id for scope
      //Subscribe to assets labeled isPrivate?
      if (this.props.ownsProfile) {
        handle = Meteor.subscribe("assets.auth", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName, this.state.showDeletedFlag, this.state.showStableFlag);
      } else {
        handle = Meteor.subscribe("assets.public", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName, this.state.showDeletedFlag, this.state.showStableFlag);
      }
    }
    else
    {
      // route did not include a user-id for scope
      handle = Meteor.subscribe("assets.public", -1, this.state.selectedAssetKinds, this.state.searchName, this.state.showDeletedFlag, this.state.showStableFlag);
    }
    let sorts = { "edited": { updatedAt: -1}, "name": {name: 1}, "kind": {kind: 1} }
    let sorter = sorts[this.state.chosenSortBy]

    return {
      assets: Azzets.find({}, {sort: sorter}).fetch(), // TODO: don't bring down content2 field
      loading: !handle.ready()
    };
  },

  handleToggleKind(k, altKey) // k is the string for the AssetKindsKey to toggle existence of in the array
  {
    let s = this.state.selectedAssetKinds
    if (altKey)
      this.setState({ selectedAssetKinds: [k] } )
    else
      this.setState({ selectedAssetKinds: _.indexOf(s,k)==-1?_.union(s,[k]):_.without(s,k) })
  },

  handleChangeShowDeletedFlag(newValue)
  {
    this.setState( {showDeletedFlag: newValue})
  },

  handleChangeShowStableFlag(newValue)
  {
    this.setState( {showStableFlag: newValue})
  },


  handleSearchGo(event)
  {
    this.setState( {searchName: this.refs.searchNameInput.value } )
  },

  render() {
    let assets = this.data.assets;    //list of assets provided via getMeteorData()

    const {user, ownsProfile} = this.props;

    if (user) {
      var {_id, createdAt} = user;
      var {name, avatar} = user.profile;
    }

    return (
      <div className="ui padded grid">

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
              <AssetKindsSelector kindsActive={this.state.selectedAssetKinds} handleToggleKindCallback={this.handleToggleKind} />
              &nbsp;
              <div className="ui icon buttons">
                <AssetShowStableSelector showStableFlag={this.state.showStableFlag} handleChangeFlag={this.handleChangeShowStableFlag} />
                <AssetShowDeletedSelector showDeletedFlag={this.state.showDeletedFlag} handleChangeFlag={this.handleChangeShowDeletedFlag} />
              </div>
            </div>
                        
            <div className="right item">
              <div className="ui action input">
                <input type="text" placeholder="Search asset name" ref="searchNameInput" size="16"></input>
                <button className="ui icon button" onClick={this.handleSearchGo}>
                  <i className="search icon"></i>
                </button>
              </div>
            </div>
            
          </div>
        </div>
                
        <div className="three wide right floated column">
          <div className="ui row">
            <AssetListSortBy chosenSortBy={this.state.chosenSortBy} handleChangeSortByClick={this.handleChangeSortByClick}/>
            <AssetCreateNew  handleCreateAssetClick={this.handleCreateAssetClickFromComponent}/>
          </div>
        </div>

        <div className="sixteen wide column" style={{ minHeight: "600px" }}>
          {this.data.loading ?
            <div><Spinner /></div>
          :
            <AssetList assets={assets} currUser={this.props.currUser} />}
        </div>
      </div>

    );
  },

  handleChangeSortByClick(newSort)
  {
      this.setState( { chosenSortBy: newSort })
  },

  handleCreateAssetClickFromComponent(assetKindKey, assetName) {
    Meteor.call('Azzets.create', {
      name: assetName,
      kind: assetKindKey,
      text: "",
      thumbnail: "",
      content2: {},
      dn_ownerName: this.props.currUser.name,

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
})