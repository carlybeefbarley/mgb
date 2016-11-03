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
    panelWidth:             PropTypes.string.isRequired,  // Typically something like "200px".
    addJoyrideSteps:        PropTypes.func.isRequired     // See react-joyride comments in App.js
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

  showFeatureLevelsSlider() {
    this.props.addJoyrideSteps([
      {
        title: 'Feature Levels Slider',
        text: 'This is the <em>Feature Levels Slider</em> area. If you are on a page with adjustable Feature Levels, there will be a slider control here; Otherwise it will be blank',
        selector: '#mgbjr-NavGadgetSliderIcon',
        position: 'left'
      },
      {
        title: 'Feature Levels Slider',
        text: `On pages with variable Feature Levels, you can adjust the current Feature Level for the current page's tools by dragging the circular 'handle' of the slider left or right`,
        selector: '#mgbjr-NavGadgetSliderIcon + input',    // finds <input> element which is after element with mgbNavGadgetSlider class
        position: 'bottom'
      },
      {
        title: 'See all Feature Level settings',
        text: `This area lists all your current Feature Level settings`,
        selector: '#mgbjr-CurrentFeatureLevelsInFp',    // finds <input> element which is after element with mgbNavGadgetSlider class
        position: 'left'
      }
    ],
    { replace: true } )
  },

  componentWillUnmount() {
    this.props.addJoyrideSteps([], { replace: true } )
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
      <div className='animated fadeIn'>
        <p>
          Some tools have a <em>Feature Level</em> <i className="ui options icon" /> slider
        </p>
        <button onClick={this.showFeatureLevelsSlider} className="ui active yellow button" style={{ marginBottom: '1em' }}>
          <i className="student icon"></i>
          Show me
        </button>
        <p>Move these sliders to enable cool stuff</p>
        <p id="mgbjr-CurrentFeatureLevelsInFp"><h4>Current Feature Levels:</h4></p>
        { _.map(expectedToolbarScopeNames, name => makeSlider(name)) }
      </div>
    )
  }
})
