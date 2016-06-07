import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import QLink from '../../routes/QLink';

export default class Sidebar extends Component {

  // static PropTypes = {
  //   user: PropTypes.object,
  //   showSidebar: PropTypes.boolean,
  // }


  render() {
    const {currUser} = this.props;

    let userContent = !!currUser ?
      (
        <div className="item">
          <div className="header">My stuff</div>
            <div className="menu">
              <QLink to={`/user/${currUser._id}/assets`} className="item">My Assets</QLink>
              <QLink to={`/user/${currUser._id}/projects`} className="item">My Projects</QLink>
          </div>
        </div>
      )
      :
      (
        <div className="item">
          <QLink to="/join">Get Started</QLink>
        </div>
      );


    return (
      <div className="ui vertical inverted narrow sidebar menu left overlay" onClick={this.props.handleToggleSidebar}>
        <div className="item"><b>My Game Builder</b></div>
        <div className="item">
          <div className="header">Home</div>
          <div className="menu">
            <QLink to="/" className="item">Home Page</QLink>
          </div>
        </div>
        {userContent}
        <div className="item">
          <div className="header">People</div>
          <div className="menu">
            <QLink to="/users" className="item">Users</QLink>
            <QLink to={`/assets`} className="item">Public Assets</QLink>
          </div>
        </div>
      </div>
        );
  }

  componentDidMount() {
    // TODO: Use context as a way to get rid of the DOM warning from sidebar.
    //       See http://stackoverflow.com/a/31533170 for explanation of this initialization
    var rootNode = ReactDOM.findDOMNode(this);
    $('.ui.sidebar').sidebar({
        transition: 'push',
      context: $(rootNode).parent()
    });

  }
}
