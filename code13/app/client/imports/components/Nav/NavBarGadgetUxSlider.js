import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'

import { getFeatureLevel, setFeatureLevel } from '/imports/schemas/settings-client'
import { expectedToolbarScopeNames, makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'


// This is used by NavBarGadget. It is the Level slider that adjusts UX complexity
// of any page from Beginner to Guru - hiding advanced options etc

// ENHANCE? We could potentially use a fancier one like http://react-component.github.io/slider/examples/marks.html

// ENHANCE: If this is made optional (e.g. if we re-use this space for other gadgets), then 
// Toolbar.js would need to handle this element not being found


export const sliderConstants = {
  sliderElementId: "NavBarGadgetUxSlider",    // Element Ids
  inactiveTitleTxt: "(This page has no adaptive toolbars, so this control is inactive)",
  disabledOpacity: 0.0
}

export default NavBarGadgetUxSlider = React.createClass({
  mixins: [ReactMeteorData],              // Needed since settings might be a reactiveDict

  propTypes: {
    currUser:     PropTypes.object,       // Currently logged in user.. or null if not logged in.
    name:         PropTypes.string        // Page title to show in NavBar breadcrumb
  },

  contextTypes: {
    settings:    PropTypes.object
  },


  getLevelVal(name) {
    return getFeatureLevel(this.context.settings, makeLevelKey(name))
  },

  getMeteorData: function() {
    const allLevels = _.map(expectedToolbarScopeNames, name => (this.getLevelVal(name) ) )
    return { levels: allLevels }
  },


  sliderChanged: function (event) {
    const levelSliderEl = document.getElementById(sliderConstants.sliderElementId)
    const newSliderLevel = parseInt(event.target.value, 10)
    
    if (levelSliderEl && levelSliderEl._levelKey)
      setFeatureLevel(this.context.settings, levelSliderEl._levelKey, newSliderLevel)

    var event = new Event('input')
    levelSliderEl.dispatchEvent(event)
  },


  getLevel: function() {
    const levelSliderEl = document.getElementById(sliderConstants.sliderElementId)

    let levelVal = 0
    if (levelSliderEl && levelSliderEl._levelKey)
      levelVal = getFeatureLevel(this.context.settings, levelSliderEl._levelKey) 
    //console.log("GADGET_getLevel",  (levelSliderEl && levelSliderEl._levelKey ? levelSliderEl._levelKey : "???"), levelVal)
    return levelVal
  },

  componentDidUpdate() {
    const levelSliderEl = document.getElementById(sliderConstants.sliderElementId)
    if (levelSliderEl) { 
      var event = new Event('input')
      levelSliderEl.dispatchEvent(event)
    }
  },

  render: function() {
    const sliderStyle =  { 
      marginTop:   "10px", 
      marginRight: "10px", 
      marginLeft:   "2px"
    }

    const iconSty = {
      position: "relative",
      top:      "-3px" 
    }

    const sliderLevel = this.getLevel()

    return (
      <div style={{ opacity: sliderConstants.disabledOpacity }}>
        <QLink query={{_fp: 'features'}}>
          <i id="mgbjr-NavGadgetSliderIcon" className="ui options icon" style={iconSty}/>
        </QLink>
        <input
          style={sliderStyle} 
          id={sliderConstants.sliderElementId}
          title={sliderConstants.inactiveTitleTxt}
          value={sliderLevel}
          type="range" 
          onChange={this.sliderChanged}
          min={1} 
          max={15} />
      </div>
    )
  }
})


export function utilMuteLevelSlider(levelSliderEl) {
  if (levelSliderEl)
  {
    levelSliderEl.setAttribute("title", sliderConstants.inactiveTitleTxt)
    levelSliderEl.disabled = true
    levelSliderEl.parentElement.style.opacity = sliderConstants.disabledOpacity
    levelSliderEl._levelKey = null
  }
}


export function utilActivateLevelSlider(maxLevel, levelKey, level) {
  const levelSliderEl = document.getElementById(sliderConstants.sliderElementId)

  if (!levelSliderEl) 
    console.warn(`Could not find sliderElementId: ${sliderConstants.sliderElementId}`)
  else
  {
    levelSliderEl._levelKey = levelKey
    levelSliderEl.disabled = false
    levelSliderEl.parentElement.style.opacity = 1
    levelSliderEl.setAttribute("title", `Change Feature Level for ${levelKey} tools`)
    levelSliderEl.setAttribute("min", "1")
    levelSliderEl.setAttribute("max", maxLevel+'')
    levelSliderEl.setAttribute("step", "1")
    levelSliderEl.value = level
  }
  return levelSliderEl
}


export function utilAdvertizeSlider(levelSliderEl) {
  if (levelSliderEl) 
  {
    var d = levelSliderEl.parentElement
    $(d).transition('jiggle', '2000ms')
  }
}