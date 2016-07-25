import React, { PropTypes } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import styles from './CalendarHeatmapStyles.css';


// See https://www.npmjs.com/package/react-calendar-heatmap for the control being used for this

export default CalendarHeatmapStyled = React.createClass({

  render: function()
  {
    return (
      <CalendarHeatmap 
        {...this.props} 
        titleForValue={(value) => { return value ? value.date : "??"} }
        onClick={ (value) => { console.log(value) } } 
        />
    )
  }

})
