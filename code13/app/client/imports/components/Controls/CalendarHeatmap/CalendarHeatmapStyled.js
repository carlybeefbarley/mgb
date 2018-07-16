import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import './CalendarHeatmapStyles.css'

// See https://www.npmjs.com/package/react-calendar-heatmap for the control being used for this

export default class CalendarHeatmapStyled extends React.PureComponent{
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
  }
}
