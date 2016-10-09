import React from 'react'
import DropArea from './components/DropArea.js'
import SmallDD from './components/SmallDD.js'

export default class BaseForm extends React.Component {

  componentDiDMount(){

  }
  options(name, key, options, props = {}){
    const val = this.data[key];
    if(val === void(0)){
      console.warn("value not defined for:", name + '[' + key + ']')
    }

    return (
      <div className={"inline fields" + (props.disabled ? " disabled": "") } title={props && props.title}>
        <label>{name}</label>
        <SmallDD options={options} onchange={(val) => {
          this.data[key] = val

          this.props.onchange && this.props.onchange()
        }} {...props} value={val} />
      </div>
    )
  }
  bool(name, key, props = {}){
    let checked = !!parseInt(this.data[key], 10)
    return (
      <div className={"inline fields" + (props.disabled ? " disabled": "") }>
        <label>{name}</label>
        <div className="ui toggle checkbox" ref={(b) => {$(b).checkbox()}} onClick={() => {
          checked = !checked

          const val = checked ? "1" : "0"
          this.data[key] = val
          console.log("change", val)
          this.props.onchange && this.props.onchange()

        }}>
          <input type="checkbox" name={key} tabIndex="0" className="hidden" ref="checkbox" checked={checked} onChange={(val) => {
            this.data[key] = val
            console.log("change", val)
            this.props.onchange && this.props.onchange()
          }} />
        </div>
      </div>
    )
  }
  text(name, key, type, props = {}){
    return (
      <div className={"inline fields" + (props.disabled ? " disabled": "") } title={props && props.title}>
        <label>{name}</label>
        <input  {...props} placeholder={name} type={type == void(0) ? "text" : type} value={this.data[key]} onChange={(e) => {
          const val = e.target.value
          if(type == "number"){
            if(props.min != void(0) && parseInt(val, 10) < props.min){
              e.target.value = props.min
              return
            }
            if(props.max != void(0) && parseInt(val, 10) > props.max){
              e.target.value = props.max
              return
            }
          }
          this.data[key] = val
          this.props.onchange && this.props.onchange()
        }}/>
      </div>
    )
  }
  textArea(name, key, props = {}){
    return (
      <div className={"inline fields" + (props.disabled ? " disabled": "") } title={props && props.title}>
        <label>{name}</label>
        <textarea rows="3" onChange={(e) => {
            const val = e.target.value
            this.data[key] = val
            this.props.onchange && this.props.onchange()
        } }>{this.data[key]}</textarea>
      </div>
    )
  }
  dropArea(name, key, kind, props , cb = null){
    props = props || {}
    return (
      <div className={"inline fields" + (props.disabled ? " disabled": "") } title={props && props.title}>
        <label>{name}</label>
        <DropArea kind={kind} {...props} value={this.data[key]} asset={this.props.asset} onChange={(val, asset) => {
          this.data[key] = val
          this.props.onchange && this.props.onchange()
          cb && cb(asset)
        }}/>
      </div>
    )
  }
}
