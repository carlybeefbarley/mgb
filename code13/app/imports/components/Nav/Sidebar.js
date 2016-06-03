import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';


import {Link, browserHistory} from 'react-router';

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
    const {currUser} = this.props;

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

    
    

    return (
      <div className="ui vertical inverted wide sidebar menu left overlay" onClick={this.props.handleToggleSidebar}>
        <Link to="/" className="item"><b>My Game Builder</b></Link>
        {userContent}
        <div className="item">
          <div className="header">People</div>
          <div className="menu">
            <Link to="/users" className="item">Users</Link>
            <Link to={`/assets`} className="item">Public Assets</Link>
          </div>
        </div>
        <div className="item">
        </div>
      </div>
        );
  }

  handleBrandClick() {
    browserHistory.push(`/`);
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
