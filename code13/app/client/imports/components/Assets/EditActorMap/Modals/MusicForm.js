import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'

import MgbMusic from '/client/imports/components/MapActorGameEngine/MageMgbMusic.js'

export default class ModalForm extends BaseForm {
  get data() {
    return this.props.asset
  }
  render() {
    if (!this.data) {
      return null
    }
    const musicOptions = {
      options: MgbMusic.musicList.map(s => ({ text: '[builtin]:' + s, value: '[builtin]:' + s })),
      title: 'Predefined music',
    }
    return <div>{this.dropArea('Music', 'music', 'music', musicOptions)}</div>
  }
}
