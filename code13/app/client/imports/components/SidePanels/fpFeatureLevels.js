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
    return (
      <div>
        <p>TODO: This will show the sliders for each of the toolbar / feature scopes:</p>
        <ul>
          { _.map(expectedToolbarScopeNames,  name => <li key={name}>{name}@{getLevelVal(name)}</li>) }
        </ul>
      </div>
    )
  }  
})