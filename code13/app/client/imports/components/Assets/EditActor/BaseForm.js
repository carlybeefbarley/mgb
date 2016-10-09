import React from 'react'
import DropArea from './components/DropArea.js'
import SmallDD from './components/SmallDD.js'

export default class BaseForm extends React.Component {

  options(name, key, options, props){
    const val = this.data[key];
    if(!val){
      debugger;
    }

    return (
      <div className="inline fields">
        <label>{name}</label>
        <SmallDD options={options} onchange={(val) => {
          this.data[key] = val

          this.props.onchange && this.props.onchange()
        }} {...props} value={val} />
      </div>
    )
  }

  text(name, key, type, props){
    return (
      <div className="inline fields">
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

  dropArea(name, key, kind, props, cb){
    return (
      <div className="inline fields">
        <label>{name}</label>
        <DropArea kind={kind} {...props} value={this.data[key]} asset={this.props.asset} onChange={(val, asset) => {
          console.log("dropped:", val)
          this.data[key] = val
          this.props.onchange && this.props.onchange()
          cb && cb(asset)
        }}/>
      </div>
    )
  }
}
