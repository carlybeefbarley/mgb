import React from 'react'
import _ from 'lodash'
import { Checkbox, Button } from 'semantic-ui-react'
import DropArea from './DropArea.js'
import SmallDD from './SmallDD.js'
import { joyrideStore } from '/client/imports/stores'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

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
  // For reactive controlled inputs; used only for text inputs
  // Components can have multiple form fields, so we need a state
  // to represent the value for each one mapped by the unique given key
  //   ex. textVal: {key1: val1, key2: val2}
  state = {
    textVal: {},
    textAreaVal: {},
    textEditorVal: {},
    dateVal: {},
  }

  // Debounce text inputs to prevent onChange on every character
  handleChange = _.debounce(() => {
    this.props.onChange && this.props.onChange()
  }, 250)

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
          value={!_.isEmpty(this.state.textVal) ? this.state.textVal[key] : this.data[key]}
          onChange={e => {
            this.data[key] = e.target.value
            let keyVal = this.state.textVal
            keyVal[key] = this.data[key]
            this.setState({ keyVal })
            this.handleChange()
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
              this.handleChange()
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
          value={!_.isEmpty(this.state.textAreaVal) ? this.state.textAreaVal[key] : this.data[key]}
          onChange={e => {
            this.data[key] = e.target.value
            let keyVal = this.state.textAreaVal
            keyVal[key] = this.data[key]
            this.setState({ keyVal })
            this.handleChange()
            if (mgbjrCT) joyrideStore.completeTag(mgbjrCT + e.target.value)
          }}
        />
      </div>
    )
  }

  // Quill.js editor
  textEditor(name, key, fieldOptions = {}) {
    /*
    * Quill modules to attach to editor
    * See http://quilljs.com/docs/modules/ for complete options
    */
    const modules = {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'color', 'blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }

    /*
     * Quill editor formats
     * See http://quilljs.com/docs/formats/
     */
    const formats = [
      'header',
      'font',
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'code-block',
      'code',
      'list',
      'bullet',
      'indent',
      'link',
      'image',
      'color',
    ]

    return (
      <div
        className={'field' + (fieldOptions.disabled ? ' disabled' : '')}
        title={fieldOptions && fieldOptions.title}
      >
        <label>{name}</label>

        <ReactQuill
          modules={modules}
          formats={formats}
          defaultValue={!_.isEmpty(this.state.textEditorVal) ? this.state.textEditorVal[key] : this.data[key]}
          onChange={content => {
            this.data[key] = content // This is an HTML string
            let keyVal = this.state.textEditorVal
            keyVal[key] = this.data[key]
            this.setState({ keyVal })
            this.handleChange()
          }}
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
          style={{ width: 'auto' }}
          type="date"
          value={!_.isEmpty(this.state.dateVal) ? this.state.dateVal[key] : this.data[key]}
          onChange={e => {
            this.data[key] = e.target.value
            let keyVal = this.state.dateVal
            keyVal[key] = this.data[key]
            this.setState({ keyVal })
            this.handleChange()
          }}
        />
      </div>
    )
  }
}