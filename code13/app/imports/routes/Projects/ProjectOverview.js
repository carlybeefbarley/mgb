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
//      return <p>No such project</p>
      project = { name: "mockProject", memberIds: [1, 2, 4] }

    const canEd = true; //this.canEdit();
    
    return (
      <div className="ui basic segment">

        <Helmet
          title="Project Overview"
          meta={[
              {"name": "description", "content": "Projects"}
          ]}
        />
        
        { this.renderHeading(project, canEd) }
        { this.renderStats(project, canEd) }

        <h4>Project Members</h4>          
        { this.renderMembers(project, canEd) }
        
        { canEd && <div><h4>Add people</h4>{this.renderAddPeople(project)}</div> } 

      </div>
    );
  },
  
  renderHeading(project, canEd)
  {
    return  <div className="ui statistic">
              <div className="label">
                Project
              </div>
              <div className="value">
                {project.name}
              </div>
            </div>
  },
  
  
  renderStats(project, canEd)
  {
    return  <div className="ui basic segment">
              <i className="privacy icon"></i>Private
              <br></br>
              <br></br>
              <b>Size:</b> ??
              <br></br>
              <b>Assets:</b> ??
              <br></br>
              <b>Updated:</b> ?? minutes ago
              <br></br>
              <br></br>
              <div className="ui labeled button">
                <div className="ui purple button">
                  <i className="heart icon"></i> Like
                </div>
                <a className="ui basic purple label">2,048</a>
              </div>
              <div className="ui labeled button">
                <div className="ui green button">
                  <i className="fork icon"></i> Forks
                </div>
                <a className="ui basic green label">1,048</a>
              </div>
            </div>      
  },
  
  renderMembers(project, canEd)
  {
    return  <div className="ui padded grid">

              { project.memberIds.map( (uid, idx) => {
                return  <div className="ui row" key={idx}> 
                          <div className="ui column">
                            <a className="ui blue label">
                              <img src="http://www.gravatar.com/avatar/1b3e88d9f94a9708c628494773003ac3?s=50&amp;d=mm"></img> stanchion &nbsp;
                              <select className={"ui compact selection dropdown" + (canEd ? "" : " disabled")} defaultValue="editor">
                                <option value="editor" key="1">Editor</option>
                                <option value="viewer" key="2">Viewer</option> 
                              </select>
                              <i className={"ui delete icon"+ (canEd ? "" : " disabled")}></i>
                            </a>
                          </div>
                        </div>
              } ) }
            </div>
  },
  
  renderAddPeople(project)
  {
    return  <div className="ui basic segment">
              <div className="ui left icon input"><i className="users icon"></i>
                <input type="text" placeholder="Search..."></input>
                <select className="ui compact selection dropdown" defaultValue="editor">
                  <option value="editor" key="1">Editor</option>
                  <option value="viewer" key="2">Viewer</option> 
                </select>
                <div type="submit" className="ui button">Add</div>
              </div>
            </div>
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
