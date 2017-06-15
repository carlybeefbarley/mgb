import _ from 'lodash'
import React from 'react'
import DropArea from './DropArea.js'
import SmallDD from './SmallDD.js'
import actorOptions from '../Assets/Common/ActorOptions.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

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

  componentDidMount() {
    this._bf_timeouts = {}
    this._bf_inProgress = false
  }
  componentWillUnmount(){
    this._bf_timeouts = null
  }

  shouldComponentUpdate(newProps, newState){
    return !this._bf_inProgress || (this.state && this.state._bf_iterations != newState._bf_iterations)
  }

  options(name, key, options, fieldOptions = {}, id = "", mgbjrCT = "", func) {
    let val = this.data[key]
    if (val === void(0))
      console.warn("value not defined for:", name + '[' + key + ']')
    if (func)
      func()

    return (
      <div id={id ? id : ""} className={"inline fields" + (fieldOptions.disabled ? " disabled": "") }
           title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <SmallDD options={options} onChange={(val) => {
          this.data[key] = val
          this.props.onChange && this.props.onChange()
          if (mgbjrCT) {
            joyrideCompleteTag(mgbjrCT + val)
          }
        }} {...fieldOptions} value={val}/>
      </div>
    )
  }

  // fieldOptions:
  //    .disabled:   disabled control
  //    .boolIsTF:   if boolIsTF===true,  then these bools are represented as Boolean true and false;
  //                 if boolIsTF===false (or is undefined), then these bools are represented as '1' and '0'
  bool(name, key, fieldOptions = {}) {
    // maybe boolIsTF - should be on by default - as it is expected value
    const checked = fieldOptions.boolIsTF ? this.data[key] : !!parseInt(this.data[key], 10)
    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") }>
        <label>{name}</label>

        <div className="ui toggle checkbox" ref={(b) => {$(b).checkbox()}} onClick={() => {
          this.data[key] = fieldOptions.boolIsTF ? !checked : (!checked ? '1' : '0')
          this.props.onChange && this.props.onChange(key)
        }}>
          <input type="checkbox" name={key} tabIndex="0" className="mgb-hidden" ref="checkbox" checked={checked}
                 onChange={(val) => {
                    this.data[key] = val
                    this.props.onChange && this.props.onChange(key)
                 }}
          />
        </div>
      </div>
    )
  }

  text(name, key, type, fieldOptions = {}) {

    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") }
           title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <input {...fieldOptions} placeholder={name} type={type == void(0) ? "text" : type} value={this.data[key]}
                                 onChange={(e) => {
          this.data[key] = e.target.value

          // special handling for input numbers and min/max value
          if (type == "number") {

            if(this._bf_timeouts[key]){
              window.clearTimeout(this._bf_timeouts[key])
            }
            this._bf_inProgress = true
            this._bf_timeouts[key] = window.setTimeout( () => {
              this._bf_inProgress = false
              if (fieldOptions.min != void(0) && parseInt(this.data[key], 10) < fieldOptions.min) {
                this.data[key] = fieldOptions.min
              }
              if (fieldOptions.max != void(0) && parseInt(this.data[key], 10) > fieldOptions.max) {
                this.data[key] = fieldOptions.max
              }
              this.props.onChange && this.props.onChange()
            }, 1000)

          }
          else
            this.props.onChange && this.props.onChange()


          // force input to update !!!!!!
          this.setState({_bf_iterations: (this.state && this.state._bf_iterations) ? this.state._bf_iterations +1 : 1})
        }}/>
      </div>
    )
  }

  textArea(name, key, fieldOptions = {}) {
    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") }
           title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <textarea rows="3" onChange={(e) => {
            const val = e.target.value
            this.data[key] = val
            this.props.onChange && this.props.onChange()
        } } value={this.data[key]}></textarea>
      </div>
    )
  }

  dropArea(name, key, kind, fieldOptions, cb = null) {
    fieldOptions = fieldOptions || {}
    if (!this.data._ids) {
      this.data._ids = {}
    }

    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") }
           title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <DropArea kind={kind} {...fieldOptions} value={this.data[key]} _id={this.data._ids[key]} asset={this.props.asset}
                  onChange={(val, asset) => {
                    this.data[key] = val
                    this.data._ids[key] = asset ? asset._id : ''
                    this.props.onChange && this.props.onChange()
                    cb && cb(asset)
        }}/>
      </div>
    )
  }
}
