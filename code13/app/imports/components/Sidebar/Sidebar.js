import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import {Link, History} from 'react-router';
import {ActivityTypes} from '../../schemas/activity.js';
import reactMixin from 'react-mixin';

@reactMixin.decorate(History)
export default class Sidebar extends Component {

  // static PropTypes = {
  //   user: PropTypes.object,
  //   showSidebar: PropTypes.boolean,
  //   activity: PropTypes.array
  // }

  constructor() {
    super();
    this.handleBrandClick = this.handleBrandClick.bind(this);
    this.listenForClose = this.listenForClose.bind(this);
  }

  render() {
    const {currUser, isSuperAdmin} = this.props;

    let userContent = !!currUser ?
      (
        <div className="item">
          <div className="header">My stuff</div>
          <div className="menu">
            <Link to={`/user/${currUser._id}/assets`} className="item">My Assets</Link>
         </div>
        </div>
      )
      :
      (
        <div className="item">
          <Link to="/join">Get Started</Link>
        </div>
      );


    let superAdminContent = !!isSuperAdmin ?
    (
      <div className="item">
        <div className="header">Super-Admin</div>
        <div className="menu">
          <Link to="/super-global-dashboard" className="item">Global Dashboard</Link>
        </div>
      </div>
    )
    :
    null;
    
    
    let activityContent = this.props.activity.map((act, i) => { 
      let iconClass = "ui " + ActivityTypes.getIconClass(act.activityType)
      
      if (act.activityType.startsWith("user.")) {
        return <Link to={"/user/" + act.byUserId}  className="item" key={i}>
                <i className={iconClass}></i>{act.description}
              </Link>
      }
      else if (act.activityType.startsWith("asset.")) {
        return  <Link to={"/assetEdit/" + act.toAssetId}  className="item" key={i}>
                <i className={iconClass}></i>{act.byUserName}: '{act.toAssetName}' {act.description} 
              </Link>
      }
      //else...
      return <div className="item" key={i}>act.activityType</div>              
    })

    return (
      <div className="ui vertical inverted sidebar menu left overlay" onClick={this.props.handleToggleSidebar}>
        <Link to="/" className="item"><b>My Game Builder</b></Link>
        {userContent}
        <div className="item">
          <div className="header">People</div>
          <div className="menu">
            <Link to="/users" className="item">Users</Link>
            <Link to={`/assets`} className="item">Public Assets</Link>
          </div>
        </div>
        {superAdminContent}
        <div className="item">
          <div className="header">Activity</div>
          <div className="menu">
            {activityContent}
          </div>
        </div>
      </div>
        );
  }

  handleBrandClick() {
    this.history.pushState(null, `/`);
  }

  listenForClose(e) {
    e = e || window.event;
    if (!this.props.showSidebar && (e.key === 'Escape' || e.keyCode === 27)) {
      this.props.handleToggleSidebar();
    }
  }

  componentDidMount() {
    window.onkeydown = this.listenForClose;

    // TODO: Use context as a way to get rid of the DOM warning from sidebar.
    //       See http://stackoverflow.com/a/31533170 for explanation of this initialization
    var rootNode = ReactDOM.findDOMNode(this);
    $('.ui.sidebar').sidebar({
        transition: 'push',
      context: $(rootNode).parent()
    });

  }
}
