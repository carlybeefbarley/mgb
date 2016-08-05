import _ from 'lodash';
import React, { PropTypes } from 'react';

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
  
  propTypes: {
    currUser:     PropTypes.object,       // Currently logged in user.. or null if not logged in.
    name:         PropTypes.string        // Page title to show in NavBar breadcrumb
  },

  sliderChanged: function (e) {
//  DO something?    console.log(e.target)
  },

  render: function() {
    const { name, currUser } = this.props
    
    const sliderStyle =  { 
      marginTop:   "10px", 
      marginRight: "10px", 
      marginLeft:   "2px"
    }

    const iconSty = {
      position: "relative",
      top:      "-3px" 
    }

    return (
      <div style={{ opacity: sliderConstants.disabledOpacity }}>
        <i className="ui options icon" style={iconSty}/>
        <input
          style={sliderStyle} 
          id={sliderConstants.sliderElementId}
          title={sliderConstants.inactiveTitleTxt}
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
  }
}


export function utilActivateLevelSlider(maxLevel, levelKey, level) {
  const levelSliderEl = document.getElementById(sliderConstants.sliderElementId)

  if (!levelSliderEl) 
    console.warn(`Could not find sliderElementId: ${sliderConstants.sliderElementId}`)
  else
  {
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