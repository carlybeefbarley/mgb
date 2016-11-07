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
        title: 'The FlexPanel area',
        text: 'This stack of icons on the right-hand side is called the <em>FlexPanel</em>',
        selector: '#mgbjr-flexPanelIcons',
        position: 'left',
        preparePage: 'closeFlexPanel',
        showStepOverlay: true
      },
      { 
        title: 'An example flexPanel - Chat',
        text: 'This icon will open/close the <em>Chat</em> FlexPanel',
        selector: '#mgbjr-flexPanelIcons-chat',
        position: 'left',
        showStepOverlay: true
      },
      { 
        title: 'An example flexPanel - Assets',
        text: 'Try this one to see various assets...',
        selector: '#mgbjr-flexPanelIcons-assets',
        position: 'left',
        showStepOverlay: false,
        awaitCompletionTag: 'mgbjr-CT-flexPanel-assets-show'
      },
      {
        title: 'Feature Levels Slider',
        text: 'This is the <em>Feature Levels Slider</em> area. If you are on a page with adjustable Feature Levels, there will be a slider control here; Otherwise it will be blank',
        selector: '#mgbjr-NavGadgetSliderIcon',
        position: 'bottom'
      },
      {
        title: 'See all Feature Level settings',
        text: `This area lists all your current Feature Level settings`,
        selector: '#mgbjr-CurrentFeatureLevelsInFp',  
        position: 'left'
      }
    ],
    { replace: true } )
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
 
    const numInputStyle = { 
      marginTop:        '0.5em',
      marginRight:      '0.4em',
      marginLeft:       '3px',
      marginBottom:     '0.4em',
      width:            '2.75em',
      backgroundColor:  'rgba(0,0,0,0)'
    }

    const sliderStyle = {
      marginTop:        '0.4em',
      marginRight:      '2px',
      marginLeft:       '2.5em'
    } 

    const makeSlider = name => {
      const maxVal = expectedToolbarScopeMaxValues[name] || 20
      return (
        <p key={name} style={{ marginLeft: '0.5em' }}>
          <i className='ui options icon' />
          &nbsp;{name} Level 
          <NumberInput
            style={numInputStyle}
            dottedBorderStyle={true}
            className='ui small input'
            value={this.getLevelValFromSettings(name) || 1}
            onValidChange={(num) => this.setLevelFromNum(name, num)}
            min={1}
            max={maxVal} />
            <span style={{color: 'grey'}}>of {maxVal}</span>
          <input
            style={sliderStyle}
            type='range'
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
          Some tools have <em>Feature Level</em>&nbsp;<i className='ui options icon' /> sliders
          <br />
          Adjust these sliders to unlock features
        </p>
        <button onClick={this.showFeatureLevelsSlider} className='ui small active yellow button' style={{ marginBottom: '1em', marginLeft: '5em' }}>
          <i className='student icon' />
          Show me
        </button>
        <div className='ui segment'>
          <h4 id='mgbjr-CurrentFeatureLevelsInFp'>Current Feature Levels:</h4>
          { _.map(expectedToolbarScopeNames, name => makeSlider(name)) }
        </div>
      </div>
    )
  }
})
