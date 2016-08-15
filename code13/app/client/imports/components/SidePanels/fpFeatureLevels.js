import _ from 'lodash'
import React, { PropTypes } from 'react'
import { expectedToolbarScopeNames, makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import { getFeatureLevel, setFeatureLevel } from '/imports/schemas/settings-client'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'


export default fpFeatureLevels = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },

  contextTypes: {
    settings:    PropTypes.object
  },

  getMeteorData: function() {
    const foo = _.map(expectedToolbarScopeNames, name => (this.getLevelVal(name) ) )
    return { levels: foo }
  },

  setLevelFromEvent(name, event) {
    setFeatureLevel(this.context.settings, makeLevelKey(name), parseInt(event.target.value, 10))
  },

  getLevelVal(name) {
    return getFeatureLevel(this.context.settings, makeLevelKey(name))
  },

  render: function () {
    const sliderStyle =  {
      marginTop: "10px",
      marginRight: "10px",
      marginLeft: "2px"
    }

    const makeSlider = (name) => (
      <p key={name}>
        <i className="ui options icon" />
        {name} @ {this.getLevelVal(name)}
        <input
          style={sliderStyle} 
          type="range" 
          value={this.getLevelVal(name) || 1}
          onChange={(e) => this.setLevelFromEvent(name, e)}
          min={1} 
          max={15} />
      </p>
    )

    return (
      <div>
        <p>On pages that support 'Feature Levels' a <i className="ui small options icon" /> slider will appear at the top of the page.</p>
        <p>It is a setting that hides advanced features from new users so they may learn without feeling overwhelmed. Slide right to increase the Feature Level</p>
        <p>Current Feature Levels:</p>
        { _.map(expectedToolbarScopeNames,  name => makeSlider(name)) }
      </div>
    )
  }  
})