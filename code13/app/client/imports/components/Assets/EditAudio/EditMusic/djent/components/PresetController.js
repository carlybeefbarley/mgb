import React, { Component } from 'react'

import InputBox from './InputBox'
import presets from '../utils/presets'

class PresetController extends Component {
  shouldComponentUpdate = nextProps => nextProps.activePresetID !== this.props.activePresetID

  onChange = event => {
    const presetID = event.target.value
    this.props.actions.applyPreset(presets.find(preset => preset.id === presetID))
  }

  render() {
    const activePreset = presets.find(preset => preset.id === this.props.activePresetID)
    const presetItems = presets.map((preset, i) => (
      <option value={preset.id} key={i}>
        {preset.description || preset.id}
      </option>
    ))

    if (!activePreset)
      presetItems.push(
        <option value="custom" key={presetItems.length}>
          Custom
        </option>,
      )

    return (
      <span>
        <select onChange={e => this.onChange(e)} value={activePreset ? this.props.activePresetID : 'custom'}>
          {presetItems}
        </select>
      </span>
    )
  }
}

export default PresetController
