import React, { Component } from 'react'
import deepEqual from 'deep-equal'

import { capitalize } from '../utils/tools'
import InputBox from './InputBox'

class BeatsController extends Component {
  shouldComponentUpdate = nextProps => !deepEqual(nextProps.beat, this.props.beat)

  onChange = (event, type) => {
    const [prop, value] = [event.target.getAttribute('id'), parseFloat(event.target.value)]
    this.props.actions.updateBeats(this.props.beat.id, prop, value)
  }

  render() {
    const getProps = type => {
      return {
        type: 'number',
        id: type,
        label: `${capitalize(type)} (1 - 8)`,
        min: 1,
        max: 8,
        defaultValue: this.props.beat[type],
        onChange: event => this.onChange(event, type),
        className: 'input-base',
        labelClassName: 'input-label',
        rightFloated: true,
      }
    }

    return (
      <div style={{ width: '330px', float: 'right' }}>
        <InputBox {...getProps('bars')} />
        &nbsp;
        <InputBox {...getProps('beats')} />
      </div>
    )
  }
}

export default BeatsController
