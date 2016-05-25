import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';
import {Projects} from '../../schemas';

import Spinner from '../../components/Nav/Spinner';
import Helmet from 'react-helmet';

import {logActivity} from '../../schemas/activity';
import {snapshotActivity} from '../../schemas/activitySnapshots.js';


// TODO: publication

export default ProjectOverview = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // params.id is the ASSET id
    user: PropTypes.object,
    currUser: PropTypes.object
  },
  
  
  getMeteorData: function() {
    let projectId = this.props.params.id
    let handleForProject = Meteor.subscribe("projects.forProjectId", projectId);

    return {
      project: Azzets.findOne(projectId),
      loading: !handleForProject.ready()    // Be aware that 'activitySnapshots' and 'projectActivity' may still be loading
    };
  },


  canEdit: function() {
    return !this.data.loading &&
           this.data.project &&
           this.props.currUser && 
           this.data.project.ownerId === this.props.currUser._id
  },
  

  render: function() {
    // One Project provided via getMeteorData()
    let project = this.data.project;
    if (this.data.loading)
      return null;

    if (!project)
      return <p>No such project</p>

    const canEd = this.canEdit();
    
    var nameFieldHighlight = (canEd && (!project.name || project.name === "")) ? " error" : "";

    return (
      <div className="ui padded grid">

        <Helmet
          title="Project Overview"
          meta={[
              {"name": "description", "content": "Projects"}
          ]}
        />
        
        Project {project.name}
      </div>
    );
  },
  
  handleProjectNameChangeInteractive: function() {
    let newName = this.refs.projectNameInput.value;

    if (newName !== this.data.project.name) {
      Meteor.call('Azzets.update', this.data.project._id, this.canEdit(), {name: newName}, (err, res) => {
        if (err) {
          this.props.showToast(err.reason, 'error')
        }
      });
      
      logActivity("project.rename",  `Rename to "${newName}" from `, null, this.data.project); 
    }
  }
})
