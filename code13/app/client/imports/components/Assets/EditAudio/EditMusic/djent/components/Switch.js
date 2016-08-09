import React, { Component } from 'react';

class Switch extends Component {
    shouldComponentUpdate = (nextProps) => this.props.isActive !== nextProps.isActive;

    render = () => {
        const inputProps   = {
            id                 : '',
            type               : 'checkbox',
            defaultChecked     : '',
            onChange           : '',
            className          : 'switch-input__input',
            containerClassName : 'switch-input',
            labelClassName     : 'input-label',
            ...this.props
        };
        const { containerClassName, labelClassName, label, id } = inputProps;

        // console.log(this.props.isActive)

        return (
            <div className={"ui toggle checkbox "}>
              <input type="checkbox" name={id} checked={(this.props.isActive ? "checked" : "")} onChange={this.props.onChange} />
              <label>{ label }</label>
            </div>
        )
    }
}

export default Switch;
