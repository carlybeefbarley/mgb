import _ from 'lodash'
import React, { PropTypes } from 'react'
import { expectedToolbars, makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import { getFeatureLevel, setFeatureLevel, resetAllFeatureLevelsToDefaults } from '/imports/schemas/settings-client'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import NumberInput from '/client/imports/components/Controls/NumberInput'
import { addJoyrideSteps } from '/client/imports/routes/App'
import { Icon } from 'semantic-ui-react'

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
    const foo = _.map(expectedToolbars.scopeNames, name => (this.getLevelValFromSettings(name) ) )
    return { levels: foo }  // This data isn't used, but because we referenced it in getMeteorData, there will be a forceUpdate() when settings change 
  },

  setLevelFromNum(name, newLevelVal) {
    setFeatureLevel(this.context.settings, makeLevelKey(name), newLevelVal)
  },

  showFeatureLevelsSlider() {
    addJoyrideSteps(':tutorials.site.settings.featureLevels', { replace: true } )
  },

  setLevelFromEvent(name, event) {
    const parsedVal = parseInt(event.target.value, 10)
    const newLevelVal = _.clamp( parsedVal || 1, 1, event.target.max)
    setFeatureLevel(this.context.settings, makeLevelKey(name), newLevelVal)
  },

  getLevelValFromSettings(name) {
    return getFeatureLevel(this.context.settings, makeLevelKey(name))
  },

  resetToDefaults() { 
    resetAllFeatureLevelsToDefaults(this.context.settings)
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
      marginTop:        '0.3em',
      marginRight:      '2px',
      marginLeft:       '2px'
    } 

    const makeSlider = name => {
      const maxVal = expectedToolbars.getMaxLevel(name)
      const defaultLevel = expectedToolbars.getDefaultLevel(name)
      const actualLevel = this.getLevelValFromSettings(name) || defaultLevel 
      const friendlyName = expectedToolbars.getFriendlyName(name)
      return (
        <div key={name} style={{ marginLeft: '0.25em',marginRight: '1em',  marginBottom: '2em' }}>
          <Icon style={{ float: 'right', marginTop: '0.15em' }} size='big' name={expectedToolbars.getIconName(name)} />
          <div style={{ marginLeft: '1em' }}>
            {friendlyName}
            <br />
            <small> 
              <span style={{color: 'grey'}}>Level </span>
              <NumberInput
                  style={numInputStyle}
                  dottedBorderStyle={true}
                  className='ui small input'
                  value={ actualLevel }
                  onValidChange={(num) => this.setLevelFromNum(name, num)}
                  min={1}
                  max={maxVal} />
                <span title={`Default level is ${defaultLevel}`} style={{color: 'grey'}}>of {maxVal}</span>
              </small>
            <br />
            <span>
              <small>1&emsp;</small>
              <input
                  style={sliderStyle}
                  type='range'
                  value={ actualLevel }
                  onChange={(e) => this.setLevelFromEvent(name, e)}
                  min={1}
                  max={maxVal} />
              <small>&emsp;{maxVal}</small>
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className='animated fadeIn'>
        <p>
          Some tools have <em>Feature Level</em>&ensp;<Icon name='options'/> sliders.
        </p>
        <p>
          Slide them to reveal advanced features
        </p>
        <button onClick={this.showFeatureLevelsSlider} className='ui small active yellow button' style={{ marginBottom: '1em', marginLeft: '5em' }}>
          <i className='student icon' />
          Show me
        </button>
        <div className='ui segment'>
          <h4 id='mgbjr-CurrentFeatureLevelsInFp'>Current Feature Levels:</h4>
          { _.map(expectedToolbars.scopeNames, name => makeSlider(name)) }
          <button onClick={this.resetToDefaults} className='ui right floated mini active yellow button'>Reset to defaults</button>
        </div>
      </div>
    )
  }
})
