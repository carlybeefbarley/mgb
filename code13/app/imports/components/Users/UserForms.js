import React, { Component, PropTypes } from 'react';
import InputStacked from '../Forms/InputStacked';

export default class UserForms extends Component {
  // static PropTypes = {
  //   inputState: React.PropTypes.object,
  //   inputsToUse: React.PropTypes.array,
  //   formError: React.PropTypes.string,
  //   formSuccess: React.PropTypes.string,
  //   handleSubmit: React.PropTypes.func,
  //   handleChange: React.PropTypes.func,
  // }

  constructor() {
    super();
    this.getInputsToUse = this.getInputsToUse.bind(this);
  }

  render() {
    const values = this.props.inputState.values;
    const errors = this.props.inputState.errors;
    const inputs = this.getInputsToUse();

    return (
      <div>
        <form className="ui form">
          {inputs}
        </form>
        <br></br>
        <button
          className="ui button"
          onClick={this.props.handleSubmit} >
          {this.props.buttonText}
        </button>
      </div>
    )
  }

  getInputsToUse() {
    const values = this.props.inputState.values;
    const errors = this.props.inputState.errors;

    let inputsToUse = this.props.inputsToUse.map((input, i) => {
      switch (input) {
        case 'email':
          return (
            <InputStacked
              key={i}
              name="email"
              handleChange={this.props.handleChange}
              value={values.email}
              errorMsg={errors.email}
              validateBy="email"
              label="Email Address"  />
          );
        case 'password':
          return (
            <InputStacked
              key={i}
              type="password"
              name="password"
              handleChange={this.props.handleChange}
              value={values.password}
              errorMsg={errors.password}
              validateBy="password"
              label="Password"
              required="true"  />
          );
        case 'confirm':
          return (
            <InputStacked
              key={i}
              type="password"
              name="confirm"
              handleChange={this.props.handleChange}
              value={values.confirm}
              errorMsg={errors.confirm}
              validateBy="confirmPassword"
              label="Confirm Password"
              required="true"  />
          );
        case 'oldPassword':
          return (
            <InputStacked
              key={i}
              type="password"
              name="oldPassword"
              handleChange={this.props.handleChange}
              value={values.oldPassword}
              errorMsg={errors.oldPassword}
              validateBy="password"
              label="Old Password"
              required="true"  />
          );
        case 'title':
          return (
            <InputStacked
              key={i}
              type="text"
              name='title'
              handleChange={this.props.handleChange}
              value={values.title}
              errorMsg={errors.title}
              label="Title (ie. Designer)"
              />
          );
        case 'name':
          return (
            <InputStacked
              key={i}
              type="text"
              name="name"
              handleChange={this.props.handleChange}
              value={values.name}
              errorMsg={errors.name}
              label="Name"
              />
          );
        case 'bio':
          return (
            <InputStacked
              key={i}
              type="text"
              name="bio"
              handleChange={this.props.handleChange}
              value={values.bio}
              errorMsg={errors.bio}
              label="Bio"
              />
          );
      }
    });
    return inputsToUse
  }
}
