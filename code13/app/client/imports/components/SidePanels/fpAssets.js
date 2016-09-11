import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import { Link } from 'react-router'
import { Azzets, Projects } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'
import AssetList from '/client/imports/components/Assets/AssetList'
import { AssetKindKeys, assetMakeSelector } from '/imports/schemas/assets'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'

export default fpAssets = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:       PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:           PropTypes.object,             // User object for context we are navigating to in main page. Can be null/undefined. Can be same as currUser, or different user
    activity:       PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    panelWidth:     PropTypes.string.isRequired   // Typically something like "200px". 
  },

  getInitialState: () => ( { searchName: "", project: null } ),

  /** 
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData: function() {
    // Much of this is copied from UserAssetList - repeats.. needs cleanup

    const userId = (this.props.user && this.props.user._id) ? this.props.user._id : null
    const nameSearch = this.state.searchName
    const handleForAssets = Meteor.subscribe(
      "assets.public", 
      null,                 // userId (nell = all)
      AssetKindKeys, 
      nameSearch,
      this.state.project,   // Project
      false,                // Show Only Deleted
      false,                // Show only Stable
      undefined,            // Use default sort order
      15                    // Limit
    )
    const assetSorter = { updatedAt: -1 }
    let assetSelector = assetMakeSelector(
      null, 
      AssetKindKeys,
      nameSearch,
      this.state.project
    )  // TODO: Bit of a gap here... username.projectname

    const handleForProjects = userId ? Meteor.subscribe("projects.byUserId", userId) : null 
    const selectorForProjects = {
      "$or": [
        { ownerId: userId },
        { memberIds: { $in: [userId]} }
      ]
    }

    return {
      assets: Azzets.find(assetSelector, {sort: assetSorter}).fetch(),          // Note that the subscription we used excludes the content2 field which can get quite large
      userProjects: userId ? Projects.find(selectorForProjects).fetch() : null, // Can be null
      loading: !handleForAssets.ready() || ( handleForProjects !== null && !handleForProjects.ready())
    }
  },

  handleSearchGo()
  {
    // TODO - disallow/escape search string
    const $button = $(this.refs.searchGoButton)
    $button.removeClass("orange")
    this.setState( { searchName: this.refs.searchNameInput.value } )
  },

  /** 
   * Make it clear that the search icon needs to be pushed while editing the search box
   * I could do this with React, but didn't want to since search triggers a few changes already
   */
  handleSearchNameBoxChanges() {
    const $button = $(this.refs.searchGoButton)
    $button.addClass("orange")
  },

  // small hack - so I don't need to reach mouse
  handleSearchNameBoxKeyUp(e) {
    if (e.which === 13) $(this.refs.searchGoButton).click()
  },

  handleChangeSelectedProjectName(name){
    this.setState( { project: name } )
  },

  render: function () {
    const { assets, userProjects, loading } = this.data       // list of assets provided via getMeteorData()
    const { user, currUser } = this.props

    return (
      <div>
        <div>
          <div className="ui small fluid action input">
            <input  type="text" 
                    placeholder="Search..." 
                    defaultValue={this.state.searchName} 
                    onChange={this.handleSearchNameBoxChanges}
                    onKeyUp={this.handleSearchNameBoxKeyUp}
                    ref="searchNameInput"
                    size="16"></input>
            <button className="ui icon button" ref="searchGoButton" onClick={this.handleSearchGo}>
              <i className="search icon"></i>
            </button>
          </div>
          { (user && userProjects) ? <ProjectSelector
            key="fpProjectSelector" // don't conflict with asset project selector
            canEdit={false}
            user={user}
            handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
            availableProjects={userProjects}
            ProjectListLinkUrl={"/u/" + user.profile.name + "/projects"}
            chosenProjectName={this.state.project} />
            : null }
        </div>
        <br></br>
        { loading ? <Spinner /> : 
          <AssetList
              allowDrag={true}
              assets={assets} 
              currUser={currUser}
              renderType="short" />
        }
      </div>
    )
  }
})