import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'

export default class ModalForm extends BaseForm {
  get data() {
    return this.props.asset
  }
  render() {
    if (!this.data) {
      return null
    }
    return (
      <div>
        {this.dropArea('Map', 'map', 'actormap')}
        <div className="allInline">
          {this.text('X', 'x', 'number')}
          {this.text('Y', 'y', 'number')}
        </div>
      </div>
    )
  }
}
