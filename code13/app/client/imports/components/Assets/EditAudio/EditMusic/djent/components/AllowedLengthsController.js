import React, { Component } from 'react'
import deepEqual from 'deep-equal'

import NotePanel from './NotePanel'

class AllowedLengthsController extends Component {
  shouldComponentUpdate = nextProps => !deepEqual(nextProps.allowedLengths, this.props.allowedLengths)

  render() {
    const { allowedLengths, actions } = this.props
    // console.log(allowedLengths)
    const totalAmount = allowedLengths.reduce((a, b) => a + b.amount, 0)
    // console.log('totalAmount', totalAmount)
    const notePanelProps = {
      actions,
      allowedLengths,
      totalAmount,
    }

    // console.log(notePanelProps)

    const lengths = allowedLengths.map((length, i) => (
      <div
        style={{
          width: '150px',
          height: '150px',
          float: 'left',
          margin: '0 10px 10px 10px',
          backgroundColor: '#424242',
          overflow: 'auto',
          borderTop: 'solid 5px #0088aa',
        }}
        key={i}
      >
        <NotePanel length={length} {...notePanelProps} />
      </div>
    ))

    return <div className="row">{lengths}</div>
  }
}

export default AllowedLengthsController
