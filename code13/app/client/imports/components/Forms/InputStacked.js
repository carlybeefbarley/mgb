import _ from 'lodash'
import React, { PropTypes } from 'react'

export default InputStacked = React.createClass({
  propTypes: {
    errorMsg:   PropTypes.string,
    label:      PropTypes.string,
    iconClass:  PropTypes.string,
    type:       PropTypes.string,
    name:       PropTypes.string,
    value:      PropTypes.string,
    handleBlur: PropTypes.func,
    handleChange: PropTypes.func
  },

  getDefaultProps: function() {
    return {
      type: 'text',
      required: false
    }
  },

  render: function() {
    let { errorMsg, label, name, styles, type, handleChange, value, validateBy, required, defaultValue } = this.props

    return (
      <div className="inline twelve wide field">
        <label htmlFor={ name } title={ label }>
          {label} 
          { errorMsg ? 
            <div className="ui pointing below red basic label">{errorMsg}</div>
              :
           <span>&nbsp;<i className="ui small green check icon"></i></span>
          }
        </label>
        <input
          className={styles || "ui input"}
          type={type}
          data-name={name}
          onChange={handleChange}
          value={value}
          checked={!!value ? value : null}
          placeholder={label}
          data-validateby={validateBy}
          required={required}
          defaultValue={defaultValue}
          {..._.omit(this.props, ["handleChange","errorMsg","type","validateBy","required"])} />

      </div>
    )
  }
})
