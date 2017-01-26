import React from 'react'
import DropArea from './DropArea.js'
import SmallDD from './SmallDD.js'

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

  options( name, key, options, fieldOptions = {} ) {
    const val = this.data[key]
    if (val === void(0))
      console.warn("value not defined for:", name + '[' + key + ']')

    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") } title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <SmallDD options={options} onChange={(val) => {
          this.data[key] = val
          this.props.onChange && this.props.onChange()
        }} {...fieldOptions} value={val} />
      </div>
    )
  }

  // fieldOptions:
  //    .disabled:   disabled control
  //    .boolIsTF:   if boolIsTF===true,  then these bools are represented as Boolean true and false;  
  //                 if boolIsTF===false (or is undefined), then these bools are represented as '1' and '0'
  bool (name, key, fieldOptions = {} ) {
    const checked = fieldOptions.boolIsTF ? this.data[key] : !!parseInt(this.data[key], 10)
    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") }>
        <label>{name}</label>
        <div className="ui toggle checkbox" ref={(b) => {$(b).checkbox()}} onClick={() => {
          const val = fieldOptions.boolIsTF ? (!checked ? true : false) : (!checked ? '1' : '0')
          this.data[key] = val
          this.props.onChange && this.props.onChange()
        }}>
          <input type="checkbox" name={key} tabIndex="0" className="hidden" ref="checkbox" checked={checked} onChange={(val) => {
            this.data[key] = val
            this.props.onChange && this.props.onChange()
          }} />
        </div>
      </div>
    )
  }

  text( name, key, type, fieldOptions = {} ) {
    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") } title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <input {...fieldOptions} placeholder={name} type={type == void(0) ? "text" : type} value={this.data[key]} onChange={(e) => {
          const val = e.target.value
          if (type == "number") {
            if (fieldOptions.min != void(0) && parseInt(val, 10) < fieldOptions.min) {
              e.target.value = fieldOptions.min
              return
            }
            if (fieldOptions.max != void(0) && parseInt(val, 10) > fieldOptions.max) {
              e.target.value = fieldOptions.max
              return
            }
          }
          this.data[key] = val
          this.props.onChange && this.props.onChange()
        }}/>
      </div>
    )
  }

  textArea (name, key, fieldOptions = {} ) {
    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") } title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <textarea rows="3" onChange={(e) => {
            const val = e.target.value
            this.data[key] = val
            this.props.onChange && this.props.onChange()
        } } value={this.data[key]}></textarea>
      </div>
    )
  }

  dropArea (name, key, kind, fieldOptions, cb = null) {
    fieldOptions = fieldOptions || {}
    return (
      <div className={"inline fields" + (fieldOptions.disabled ? " disabled": "") } title={fieldOptions && fieldOptions.title}>
        <label>{name}</label>
        <DropArea kind={kind} {...fieldOptions} value={this.data[key]} asset={this.props.asset} onChange={(val, asset) => {
          this.data[key] = val
          this.props.onChange && this.props.onChange()
          cb && cb(asset)
        }}/>
      </div>
    )
  }
}
