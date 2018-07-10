import React, { Component } from 'react'
import deepEqual from 'deep-equal'

import { capitalize } from '../utils/tools'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers.js'

class NotePanel extends Component {
  onLengthAmountChange = (event, value) => {
    const { id, amount } = this.props.length
    const newAmount = amount + value

    if (newAmount < 0) return

    this.updateAllowedLengthsByID(id, 'amount', newAmount)
  }

  onIsTripletChange = event => {
    const [id, value] = [event.target.getAttribute('data-id'), event.target.checked]
    this.updateAllowedLengthsByID(id, 'isTriplet', value)
  }

  updateAllowedLengthsByID = (id, prop, value) => {
    const newAllowedLengths = this.props.allowedLengths.map(obj => {
      const newObj = { ...obj }
      if (newObj.id === id) newObj[prop] = value
      return newObj
    })

    this.props.actions.updateAllowedLengths(newAllowedLengths)
  }

  render() {
    const { length, totalAmount } = this.props
    // console.log(this.props)
    // const noteName = `${capitalize(length.name)} note`;
    const noteName = length.id + '/4 note'
    const percentage = totalAmount ? Math.round(length.amount / totalAmount * 100) : 0
    const isOn = length.amount > 0

    return (
      <div style={{ color: 'white' }}>
        <div style={{ height: '65px' }}>
          <img
            src={makeCDNLink(`/images/notes/${length.name}.svg`)}
            alt={noteName}
            title={noteName}
            style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', top: '10px' }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <span title="Chance" style={{ display: 'inline-block' }}>
            {percentage}% &nbsp;
          </span>
          <div style={{ display: 'inline-block' }}>
            <button
              className="ui mini icon button"
              title="Increase chance"
              onClick={e => this.onLengthAmountChange(e, 1)}
            >
              <i className="arrow up icon" />
            </button>
            <button
              className="ui mini icon button"
              title="Decrease chance"
              onClick={e => this.onLengthAmountChange(e, -1)}
            >
              <i className="arrow down icon" />
            </button>
          </div>
        </div>
        <div
          className="ui checkbox"
          style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', marginTop: '10px' }}
        >
          <input
            type="checkbox"
            id={`${length.id}-triplet`}
            data-id={length.id}
            checked={length.isTriplet}
            onChange={this.onIsTripletChange}
          />
          <label htmlFor={`${length.id}-triplet`} style={{ color: 'white' }}>
            Triplet
          </label>
        </div>
      </div>
    )
  }
}

export default NotePanel
