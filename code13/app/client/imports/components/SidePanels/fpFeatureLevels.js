import _ from 'lodash'
import React, { PropTypes } from 'react'
import { expectedToolbarScopeNames, expectedToolbarScopeMaxValues, makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import { getFeatureLevel, setFeatureLevel } from '/imports/schemas/settings-client'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import NumberInput from '/client/imports/components/Controls/NumberInput'

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
    const foo = _.map(expectedToolbarScopeNames, name => (this.getLevelValFromSettings(name) ) )
    return { levels: foo }
  },

  setLevelFromNum(name, newLevelVal) {
    setFeatureLevel(this.context.settings, makeLevelKey(name), newLevelVal)
  },


  setLevelFromEvent(name, event) {
    const parsedVal = parseInt(event.target.value, 10)
    const newLevelVal = _.clamp( parsedVal || 1, 1, event.target.max)
    setFeatureLevel(this.context.settings, makeLevelKey(name), newLevelVal)
  },

  getLevelValFromSettings(name) {
    return getFeatureLevel(this.context.settings, makeLevelKey(name))
  },

  render: function () {
    const sliderStyle =  {
      marginTop: "10px",
      marginRight: "2px",
      marginLeft: "2px"
    }
    const numStyle =  {
      marginTop: "10px",
      marginRight: "10px",
      marginLeft: "2px",
      width: "3em",
      backgroundColor: "rgba(0,0,0,0)" 
    }


    const makeSlider = (name) => {
      const maxVal = expectedToolbarScopeMaxValues[name] || 20
      return (
        <p key={name}>
          <i className="ui options icon" />
          {name} @ 
          <NumberInput
            style={numStyle} 
            dottedBorderStyle={true}
            className="ui small input"
            value={this.getLevelValFromSettings(name) || 1}
            onValidChange={(num) => this.setLevelFromNum(name, num)}
            min={1} 
            max={maxVal} /> of {maxVal}
          <input
            style={sliderStyle} 
            type="range"
            value={this.getLevelValFromSettings(name) || 1}
            onChange={(e) => this.setLevelFromEvent(name, e)}
            min={1} 
            max={maxVal} />
        </p>
      )
    }

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