import _ from 'lodash'
import React, { PropTypes } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import './CalendarHeatmapStyles.css'

// See https://www.npmjs.com/package/react-calendar-heatmap for the control being used for this

const CalendarHeatmapStyled = React.createClass({
  render() {
    return (
      <CalendarHeatmap
        {...this.props}
        titleForValue={value => {
          return value ? value.date : '??'
        }}
        onClick={value => {
          console.log(value)
        }}
      />
    )
  },
})

export default CalendarHeatmapStyled
