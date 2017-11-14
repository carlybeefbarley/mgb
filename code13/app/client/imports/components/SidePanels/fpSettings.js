import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Segment, Header, Icon } from 'semantic-ui-react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { expectedToolbars } from '/client/imports/components/Toolbar/expectedToolbars'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import {
  getFeatureLevel,
  setFeatureLevel,
  resetAllFeatureLevelsToDefaults,
} from '/imports/schemas/settings-client'
import NumberInput from '/client/imports/components/Controls/NumberInput'

const _highlightRelevantAreasColor = 'rgba(255,255,0,0.15)'

const _numInputStyle = {
  marginTop: '0.5em',
  marginRight: '0.4em',
  marginLeft: '3px',
  marginBottom: '0.4em',
  width: '2.75em',
  backgroundColor: 'rgba(0,0,0,0)',
}

const _sliderStyle = {
  marginTop: '0.3em',
  marginRight: '2px',
  marginLeft: '2px',
}

const fpSettings = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    user: PropTypes.object, // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth: PropTypes.string.isRequired, // Typically something like "200px".
    currentlyEditingAssetInfo: PropTypes.object.isRequired, // An object with some info about the currently edited Asset - as defined in App.js' this.state
  },

  contextTypes: {
    settings: PropTypes.object,
  },

  getMeteorData() {
    const foo = _.map(expectedToolbars.scopeNames, name => this.getLevelValFromSettings(name))
    return { levels: foo } // This data isn't used, but because we referenced it in getMeteorData, there will be a forceUpdate() when settings change
  },

  setLevelFromNum(name, newLevelVal) {
    setFeatureLevel(this.context.settings, makeLevelKey(name), newLevelVal)
  },

  setLevelFromEvent(name, event) {
    const parsedVal = parseInt(event.target.value, 10)
    const newLevelVal = _.clamp(parsedVal || 1, 1, event.target.max)
    setFeatureLevel(this.context.settings, makeLevelKey(name), newLevelVal)
  },

  getLevelValFromSettings(name) {
    return getFeatureLevel(this.context.settings, makeLevelKey(name))
  },

  resetToDefaults() {
    resetAllFeatureLevelsToDefaults(this.context.settings)
  },

  render() {
    const makeSlider = name => {
      const maxVal = expectedToolbars.getMaxLevel(name)
      const defaultLevel = expectedToolbars.getDefaultLevel(name)
      const actualLevel = this.getLevelValFromSettings(name) || defaultLevel
      const friendlyName = expectedToolbars.getFriendlyName(name)
      const isHighlighted = expectedToolbars.getIsUsedForAssetKind(
        name,
        this.props.currentlyEditingAssetInfo.kind,
      )
      const outerSty = {
        padding: '0.35em 0.15em',
        marginLeft: '0.1em',
        marginRight: '0.85em',
        marginBottom: '1.35em',
      }
      if (isHighlighted) outerSty.backgroundColor = _highlightRelevantAreasColor
      return (
        <div key={name} style={outerSty}>
          <Icon
            style={{ float: 'left', marginTop: '0.15em', marginRight: '0.5em' }}
            color="grey"
            size="big"
            name={expectedToolbars.getIconName(name)}
          />
          <div style={{ marginLeft: '0.5em' }}>
            {friendlyName}
            <br />
            <small>
              <span style={{ color: 'grey' }}>Level </span>
              <NumberInput
                style={_numInputStyle}
                dottedBorderStyle
                className="ui small input"
                value={actualLevel}
                onValidChange={num => this.setLevelFromNum(name, num)}
                min={1}
                max={maxVal}
              />
              <span title={`Default level is ${defaultLevel}`} style={{ color: 'grey' }}>
                of {maxVal}
              </span>
            </small>
            <br />
            <span>
              <small>1&emsp;</small>
              <input
                style={_sliderStyle}
                type="range"
                value={actualLevel}
                onChange={e => this.setLevelFromEvent(name, e)}
                min={1}
                max={maxVal}
                id={'mgbjr-input-level-slider-' + name}
              />
              <small>&emsp;{maxVal}</small>
            </span>
          </div>
        </div>
      )
    }

    return (
      <div>
        <Header
          as="h3"
          id="mgbjr-CurrentFeatureLevelsInFp"
          content="Current Feature Levels"
          subheader="Slide to enable advanced features"
        />
        {_.map(expectedToolbars.scopeNamesTunable, name => makeSlider(name))}
        <button onClick={this.resetToDefaults} className="ui right floated mini active yellow button">
          Reset to defaults
        </button>
      </div>
    )
  },
})

export default fpSettings
