import _ from 'lodash'
import React, { PropTypes } from 'react'
import { expectedToolbarScopeNames, getLevelVal } from '/client/imports/components/Toolbar/Toolbar'


export default fpFeatureLevels = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const sliderStyle =  { 
      marginTop: "10px", 
      marginRight: "10px", 
      marginLeft: "2px"
    }

    const makeSlider = (name) => (
      <p key={name}>
        <i className="ui university icon" />
        {name} @ {getLevelVal(name)}
        <input
          style={sliderStyle} 
          type="range" 
          value={getLevelVal(name) || 1}
          min={1} 
          max={15} />
      </p>
    )

    return (
      <div>
        <p>We hide many features from beginners and allow users to enable more functions as they learn the site.  These sliders show the current feature enablement of various tools. </p>
        <ul>
          { _.map(expectedToolbarScopeNames,  name => makeSlider(name)) }
        </ul>
        <p>On pages that support 'Feature Levels' a slider will appear at the top of the page.</p>
        <p>When this is shown, you can slide that Feature Level slider to rightwards to enable more features and to shrink icons</p>
      </div>
    )
  }  
})