import _ from 'lodash'
import React, { PropTypes } from 'react'

import CalendarHeatmapStyled from '/client/imports/components/Controls/CalendarHeatmap/CalendarHeatmapStyled'

const ActivityHeatmap = React.createClass({
  propTypes: {
    user: PropTypes.object,
    className: PropTypes.string,
  },

  render() {
    const { user } = this.props

    if (!user) return null

    return (
      <div className={this.props.className}>
        <h2 style={{ display: 'inline-block' }}>Activity</h2>&emsp;<em style={{ color: 'red' }}>(fake data for now)</em>
        <CalendarHeatmapStyled
          endDate={new Date()}
          numDays={180}
          values={[
            { date: '2016-07-01', count: 1 },
            { date: '2016-07-22', count: 3 },
            { date: '2016-07-22', count: 3 },
            { date: '2016-07-16', count: 6 },
            // ...and so on
          ]}
        />
      </div>
    )
  },
})

export default ActivityHeatmap
