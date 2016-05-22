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

import Spinner from '../../components/Nav/Spinner';
import {browserHistory} from 'react-router';
import Helmet from 'react-helmet';
import UserItem from '../../components/Users/UserItem.js';


export default  UserAssetListRoute = React.createClass({
  mixins: [ReactMeteorData],

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
    let handle = Meteor.subscribe("assets.public", this.props.params.id, this.state.selectedAssetKinds, this.state.searchName, this.state.projectSelected, this.state.showDeletedFlag, this.state.showStableFlag);
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


  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnter)
  },
  
  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnter)
  },
  
  listenForEnter: function(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      this.handleSearchGo();
    }
  },

  handleSearchGo()
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
      <div className="ui horizontal segments" style={{border: 0}}>

        <Helmet
          title="Assets"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />
        
        <div className="ui segment" style={{ minHeight: "600px", minWidth:"220px", maxWidth:"220px" }}>

          <div className="ui row">
            <div className="ui large header">{ user ? (name + "'s Assets") : ("Public assets") }
          </div>       

          <div className="ui row">
            <div className="ui action input">
              <input type="text" placeholder="Search..." ref="searchNameInput" size="16"></input>
              <button className="ui icon button" onClick={this.handleSearchGo}>
                <i className="search icon"></i>
              </button>
              </div>
            </div>            
          </div>

          <div className="ui hidden divider"></div>

          <div className="ui row">
            { user ? <ProjectSelector 
                      canEdit={this.props.ownsProfile}
                      availableProjectNamesArray={projectNames}
                      handleCreateNewProject={this.handleCreateNewProject}
                      chosenProjectName={this.state.projectSelected}
                      handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
                      />
            : null }
            <div className="ui popup">
              {user ? <UserItem
                      name={name}
                      avatar={avatar ? avatar : null}
                      createdAt={createdAt}
                      _id={_id} />
                    : null
            }
            </div>
          </div>

          <div className="ui hidden divider"></div>

          <div className="ui row">
            Show asset kinds:
            <AssetKindsSelector kindsActive={this.state.selectedAssetKinds} handleToggleKindCallback={this.handleToggleKind} />
          </div>
          
          <div className="ui hidden divider"></div>

          <div className="ui row">
            <div className="ui secondary compact borderless fitted menu">            
              <AssetShowStableSelector showStableFlag={this.state.showStableFlag} handleChangeFlag={this.handleChangeShowStableFlag} />
              <AssetShowDeletedSelector showDeletedFlag={this.state.showDeletedFlag} handleChangeFlag={this.handleChangeShowDeletedFlag} />
            </div>
          </div>
        </div>

            
        

        <div className="ui segment" style={{ minHeight: "600px"}}>        
          <div className="ui row">
            <div className="four wide right floated column">
              <div className="ui row">
                <AssetCreateNew  handleCreateAssetClick={this.handleCreateAssetClickFromComponent}/>
                <AssetListSortBy chosenSortBy={this.state.chosenSortBy} handleChangeSortByClick={this.handleChangeSortByClick}/>
              </div>
            </div>
          </div>
          
          <div className="ui hidden divider"></div>

          <div className="ui row">          
            {this.data.loading ?
              <div><Spinner /></div>
            :
              <AssetList assets={assets} currUser={this.props.currUser} />}
          </div>
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
        newAsset._id = result; // So activity log will work
        logActivity("asset.create",  `Create ${assetKindKey}`, null, newAsset);
        browserHistory.push(`/assetEdit/${result}`)
      }
    });
  }
})