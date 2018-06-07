import React from 'react'
import { Checkbox, Grid } from 'semantic-ui-react'

import DropArea from './DropArea.js'
import SmallDD from './SmallDD.js'
import { joyrideStore } from '/client/imports/stores'

// This partial class uses the following React props..
// propTypes: {
//   onchange: PropTypes.func,       // onchange handler for field. NOT same as onChange!! Beware!
//   asset:    PropTypes.object      // an Asset - this is needed for the
// }

// For best visuals also define an alignment for the form labels.. for example a css with
// .edit-game .form .inline > label {
//     min-width: 30% !important;
//     text-align: right !important;
// }

export default class BaseForm extends React.Component {
  options(name, key, options, fieldOptions = {}, mgbjrCT = '', id = '', func) {
    let val = this.data[key]
    if (val === void 0) console.warn('value not defined for:', name + '[' + key + ']')

    return (
      <div
        id={id ? id : ''}
        className={'field' + (fieldOptions.disabled ? ' disabled' : '')}
        title={fieldOptions && fieldOptions.title}
      >
        <label>{name}</label>
        <SmallDD
          options={options}
          onChange={val => {
            this.data[key] = val
            if (func) func()
            if (mgbjrCT) joyrideStore.completeTag(mgbjrCT + val)
            this.props.onChange && this.props.onChange()
          }}
          {...fieldOptions}
          value={val}
        />
      </div>
    )
  }

  // fieldOptions:
  //    .disabled:   disabled control
  //    .boolIsTF:   if boolIsTF===true,  then these bools are represented as Boolean true and false;
  //                 if boolIsTF===false (or is undefined), then these bools are represented as '1' and '0'
  bool(name, key, fieldOptions = {}, mgbjrCT = '', id = '') {
    // maybe boolIsTF - should be on by default - as it is expected value
    const checked = fieldOptions.boolIsTF ? this.data[key] : !!parseInt(this.data[key], 10)
    return (
      <div id={id ? id : ''} className={'field' + (fieldOptions.disabled ? ' disabled' : '')}>
        <label>{name}</label>

        <Checkbox
          toggle
          name={key}
          checked={checked}
          onChange={() => {
            this.data[key] = fieldOptions.boolIsTF ? !checked : !checked ? '1' : '0'
            console.log('onChange dataKey', this.data[key])
            if (mgbjrCT) joyrideStore.completeTag(mgbjrCT)
            this.props.onChange && this.props.onChange(key)
          }}
        />
      </div>
    )
  }

  text(name, key, type, fieldOptions = {}) {
    return (
      <div
        className={'field' + (fieldOptions.disabled ? ' disabled' : '')}
        title={fieldOptions && fieldOptions.title}
      >
        <label>{name}</label>
        <input
          {...fieldOptions}
          placeholder={name}
          type={type == void 0 ? 'text' : type}
          value={this.data[key]}
          onChange={e => {
            this.data[key] = e.target.value
            this.props.onChange && this.props.onChange()
          }}
          onBlur={() => {
            // special handling for input numbers and min/max value
            if (type == 'number') {
              if (fieldOptions.min != void 0 && parseInt(this.data[key], 10) < fieldOptions.min) {
                this.data[key] = fieldOptions.min
              }
              if (fieldOptions.max != void 0 && parseInt(this.data[key], 10) > fieldOptions.max) {
                this.data[key] = fieldOptions.max
              }
              if (fieldOptions.default != void 0 && !this.data[key]) this.data[key] = fieldOptions.default
              this.props.onChange && this.props.onChange()
            }
          }}
        />
      </div>
    )
  }

  textArea(name, key, fieldOptions = {}, mgbjrCT = '') {
    return (
      <div
        className={'field' + (fieldOptions.disabled ? ' disabled' : '')}
        title={fieldOptions && fieldOptions.title}
      >
        <label>{name}</label>
        <textarea
          rows="3"
          onChange={e => {
            const val = e.target.value
            this.data[key] = val
            this.props.onChange && this.props.onChange()
            if (mgbjrCT) joyrideStore.completeTag(mgbjrCT + val)
          }}
          value={this.data[key]}
        />
      </div>
    )
  }

  dropArea(name, key, kind, fieldOptions, cb = null) {
    fieldOptions = fieldOptions || {}
    if (!this.data._ids) {
      this.data._ids = {}
    }

    return (
      <div
        className={'field' + (fieldOptions.disabled ? ' disabled' : '')}
        title={fieldOptions && fieldOptions.title}
      >
        <label>{name}</label>
        <DropArea
          kind={kind}
          {...fieldOptions}
          value={this.data[key]}
          _id={this.data._ids[key]}
          asset={this.props.asset}
          onChange={(val, asset) => {
            this.data[key] = val
            this.data._ids[key] = asset ? asset._id : ''
            this.props.onChange && this.props.onChange()
            cb && cb(asset)
          }}
        />
      </div>
    )
  }

  date(name, key, fieldOptions = {}) {
    return (
      <div
        className={'field' + (fieldOptions.disabled ? ' disabled' : '')}
        title={fieldOptions && fieldOptions.title}
      >
        <label>{name}</label>
        <input
          {...fieldOptions}
          type="date"
          placeholder={name}
          value={this.data[key]}
          onChange={e => {
            this.data[key] = e.target.value
            this.props.onChange && this.props.onChange()
          }}
        />
      </div>
    )
  }
}
