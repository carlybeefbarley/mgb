import React, {Component, PropTypes} from 'react';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import Sidebar from '../components/Sidebar/Sidebar';
import reactMixin from 'react-mixin';
import Helmet from "react-helmet";
import {Teams, Users} from '../schemas';
import Spinner from '../components/Spinner/Spinner';
import Toast from '../components/Toast/Toast';

import global from '../styles/global.css';
import styles from './app.css';

@reactMixin.decorate(ReactMeteorData)
export default class App extends Component {
  static propTypes = {
    params: PropTypes.object,
    query: PropTypes.object
  }

  constructor() {
    super();
    this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
    this.showToast = this.showToast.bind(this);
    this.closeToast = this.closeToast.bind(this);
    this.state = {
      initialLoad: true,
      showToast: false,
      toastMsg: '',
      toastType: 'success'
    };
  }

  getMeteorData() {
    let handle = Meteor.subscribe("teams")
    Meteor.subscribe("user", this.props.params.id)
    return {
      currUser: Meteor.user(), //putting it here makes it reactive
      user: Meteor.users.findOne(this.props.params.id),
      team: Teams.findOne(this.props.params.teamId),
      loading: !handle.ready(),
    };
  }

  render() {
    if (this.data.loading) {
      return (<div><Spinner /></div>);
    }

    const {currUser, user, team} = this.data

    //Back arrow button in nav menu works by either grabbing "back" props in Route (see index.js in /routes)
    //Or by clearing all params/queries
    const { query, pathname } = this.props.location
    const backLink =
        !_.isEmpty(query) ? pathname :
        this.props.routes[1].back ? this.props.routes[1].back :
        null

    //Check permissions of current user for super-admin,
    //if user is on their own profile route,
    //or if user has roles on current team route
    let isSuperAdmin = false;
    let teamRoles = []
    let ownsProfile = false;
    if (currUser) {
      if (user) ownsProfile = currUser._id === user._id
      let permissions = currUser.permissions;
      if (permissions) {
        permissions.map((permission) => {
          if (permission.roles[0] === "super-admin") {
            isSuperAdmin = true;
          }
          if (team && permission.teamId == team._id) {
            teamRoles = permission.roles
          }
        })
      }
    }

    return (
      <div>
        <Helmet
          title="MyGameBuilder v2"
          titleTemplate="%s - devlapse.com"
          meta={[
              {"name": "description", "content": "MyGameBuilder v2"}
          ]}
        />

        <Sidebar
          team={team}
          isSuperAdmin={isSuperAdmin}
          user={user}
          currUser={currUser}
          handleToggleSidebar={this.handleToggleSidebar}
          initialLoad={this.state.initialLoad} />

        <div className="pusher" >
            <Nav
              user={currUser}
              handleToggleSidebar={this.handleToggleSidebar}
              name={this.props.routes[1].name}
              back={backLink} />

            {this.state.showToast ?
              <Toast
                content={this.state.toastMsg}
                closeToast={this.closeToast}
                type={this.state.toastType} />
            : null}


            <div className={styles.app}>

              {React.cloneElement(this.props.children, {
                  //Make below props available to all routes.
                  team: team,
                  user: user,
                  currUser: currUser,
                  teamRoles: teamRoles,
                  ownsProfile: ownsProfile,
                  isSuperAdmin: isSuperAdmin,
                  showToast: this.showToast,
                })
              }
            </div>
          </div>
          <Footer />
      </div>
    );
  }

  showToast(content, type) {
    this.setState({
      showToast: true,
      //toastMsg content is string that accepts HTML
      toastMsg: content,
      //String: 'error' or 'success'
      toastType: type
    });
    window.setTimeout(() => {
      this.closeToast()
    }, 2000);
  }

  closeToast() {
    this.setState({
      showToast: false,
      toastMsg: ''
    });
  }


  handleToggleSidebar() {
    $('.ui.sidebar').sidebar('toggle');
  }
}
