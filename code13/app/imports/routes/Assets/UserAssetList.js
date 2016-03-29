import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';

import {Azzets} from '../../schemas';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';
import {logActivity} from '../../schemas/activity';

import AssetList from '../../components/Assets/AssetList';
import AssetCreateNew from '../../components/Assets/AssetCreateNew.js';
import AssetKindsSelector from '../../components/Assets/AssetKindsSelector.js';
import AssetShowDeletedSelector from '../../components/Assets/AssetShowDeletedSelector.js';
import AssetShowStableSelector from '../../components/Assets/AssetShowStableSelector.js';
import AssetListSortBy from '../../components/Assets/AssetListSortBy';
import ProjectSelector from '../../components/Assets/ProjectSelector';

import Spinner from '../../components/Spinner/Spinner';
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
      projectSelected: null,    // A string.  Null means any/all. It's the only valid value if the user is not specified
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
        handle = Meteor.subscribe("assets.auth", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName, this.state.projectSelected, this.state.showDeletedFlag, this.state.showStableFlag);
      } else {
        handle = Meteor.subscribe("assets.public", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName, this.state.projectSelected, this.state.showDeletedFlag, this.state.showStableFlag);
      }
    }
    else
    {
      // route did not include a user-id for scope
      handle = Meteor.subscribe("assets.public", -1, this.state.selectedAssetKinds, this.state.searchName, this.state.projectSelected, this.state.showDeletedFlag, this.state.showStableFlag);
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
      var {name, avatar, projectNames} = user.profile;
      if (!projectNames)
        projectNames = [];
    }
    
    return (
      <div className="ui padded grid">

        <Helmet
          title="Assets"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />
        
        <div className="ui row">
          <div className="five wide column">
            <div className="ui large header">{ user ? (name + "'s Assets") : ("Public assets") }
              <div className="ui sub header">{assets.length} Assets</div>
            </div>
          </div>
          
          <div className="four wide column">
          { user ? <ProjectSelector 
                      canEdit={this.props.ownsProfile}
                      availableProjectNamesArray={projectNames}
                      handleCreateNewProject={this.handleCreateNewProject}
                      chosenProjectName={this.state.projectSelected}
                      handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
                      />
            : null }
          </div>

          <div className="right floated compact four wide column">
            {user ? <UserItem
                name={name}
                avatar={avatar ? avatar : null}
                createdAt={createdAt}
                _id={_id} />
              : null
            }
          </div>
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
                
        <div className="four wide right floated column">
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
  
  handleChangeSelectedProjectName(chosenProjectName)
  {
    this.setState( {projectSelected: chosenProjectName})
  },
  
  handleCreateNewProject(newProjectName)
  {
    var self=this
    let user = this.props.user
    if (!user)
    {
      console.log("internal error - No clear user to add project name to")
      return
    }
    
    let projectNames = user.profile.projectNames || []    
    projectNames.push(newProjectName)
    
    var savedNewProjectName = newProjectName
        
    Meteor.call('User.updateProfile', user._id, {
      "profile.projectNames": projectNames
    }, (error,result) => {
      if (error) {
         console.log("Could not update project names list")
      } else {
        logActivity("project.create",  `Create project ${savedNewProjectName}`);
        self.setState( {projectSelected: savedNewProjectName})
      }
    });
    
  },

  handleChangeSortByClick(newSort)
  {
      this.setState( { chosenSortBy: newSort })
  },

  handleCreateAssetClickFromComponent(assetKindKey, assetName) {
    let newAsset = {
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
    }
    Meteor.call('Azzets.create', newAsset, (error, result) => {
      if (error) {
          alert("cannot create asset because: " + error.reason);
      } else {
        logActivity("asset.create",  `Create ${assetKindKey}`, null, newAsset);
        this.history.pushState(null, `/assetEdit/${result}`)
      }
    });
  }
})