import _ from 'lodash';
import React, { PropTypes } from 'react';
import NavBarGadgetUxSlider from './NavBarGadgetUxSlider';

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column on the left and the FlexPanel on the right). 

// The NavBarGadget is primarily used for the Level slider that adjusts UX complexity
// of any page from Beginner to Guru - hiding advanced options etc

// This component is just a 1:1 indirection for now to support future swappable NavGadgets

export default NavBarGadget = React.createClass({
  
  propTypes: {
    currUser:     PropTypes.object,       // Currently logged in user.. or null if not logged in.
    name:         PropTypes.string        // Page title to show in NavBar breadcrumb. This will be used for context (e.g. which page level)
  },


  render: function() {
    return (
      <NavBarGadgetUxSlider {...this.props}/>
    )
  }
})


// Here's some code for when I want to resurrect the Focus Message for ADHD people like me ;)

/****
  { (currUser && currUser.profile.focusMsg) && 
    <QLink to={`/u/${currUser.profile.name}`} className=" item " title={"You set this focus goal " + moment(currUser.profile.focusStart).fromNow()}>
      <i className="alarm icon"></i> {currUser.profile.focusMsg}
    </QLink>
  }
 */