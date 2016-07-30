import _ from 'lodash';
import React, { PropTypes } from 'react';
import SpecialGlobals from '/client/imports/SpecialGlobals';

// This is used by NavBarGadget. It is the Level slider that adjusts UX complexity
// of any page from Beginner to Guru - hiding advanced options etc

// ENHANCE? We could potentially use a fancier one like http://react-component.github.io/slider/examples/marks.html

// ENHANCE: If this is made optional (e.g. if we re-use this space for other gadgets), then 
// Toolbar.js would need to handle this element not being found

export default NavBarGadgetUxSlider = React.createClass({
  
  propTypes: {
    currUser:     PropTypes.object,       // Currently logged in user.. or null if not logged in.
    name:         PropTypes.string        // Page title to show in NavBar breadcrumb
  },


  render: function() {
    const { name, currUser, } = this.props
    const sty =  { marginTop: "10px", marginRight: "10px", marginLeft: "2px" }

    return (
      <div>
        <i className="ui university icon" />
        <input 
          style={sty} 
          id={SpecialGlobals.ElementId.NavBarGadgetUxSlider}
          type="range" 
          min={1} 
          max={15} />
      </div>
    )
  }
})