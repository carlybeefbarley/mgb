import React from 'react';

export default InputStacked = React.createClass({
  propTypes: {
    errorMsg: React.PropTypes.string,
    label: React.PropTypes.string,
    iconClass: React.PropTypes.string,
    type: React.PropTypes.string,
    name: React.PropTypes.string,
    value: React.PropTypes.string,
    handleBlur: React.PropTypes.func,
    handleChange: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      type: 'text',
      required: false
    };
  },

  render: function() {
    let message;
    if (this.props.errorMsg) {
      message = {__html: '- ' + this.props.errorMsg};
    }

    return (
      <div className="inline six wide field">
        <label htmlFor={ this.props.name } title={ this.props.label }>
          {this.props.label} <span dangerouslySetInnerHTML={message} />
          {this.props.errorMsg === '' ? <i className="ui check icon"></i> : null}
        </label>
        <input
          className={this.props.styles || "ui input"}
          type={this.props.type}
          data-name={this.props.name}
          onChange={this.props.handleChange}
          value={this.props.value}
          checked={this.props.value == true ? this.props.value : null}
          placeholder={this.props.label}
          data-validateby={this.props.validateBy}
          required={this.props.required}
          defaultValue={this.props.defaultValue}
          {...this.props} />

      </div>
    );
  }
})
