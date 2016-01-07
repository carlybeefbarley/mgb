import React, { Component, PropTypes } from 'react';
import InputStacked from '../../components/Forms/InputStacked';
import styles from './assetForms.css';
import AssetKindChooser from './AssetKindChooser';


export default class AssetForms extends Component {
  static PropTypes = {
    inputState: PropTypes.object,
    inputsToUse: PropTypes.array,
    formError: PropTypes.string,
    formSuccess: PropTypes.string,
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func
  }

  constructor() {
    super();
    this.getInputsToUse = this.getInputsToUse.bind(this);
  }

  render() {
    const values = this.props.inputState.values;
    const errors = this.props.inputState.errors;
    let inputs = this.getInputsToUse();

    return (
      <div>
        <form className={styles.form}>
          {inputs}
        </form>
        <button
          type="submit"
          className={this.props.shakeBtn ? styles.btnShake : styles.btn}
          onClick={() => this.props.handleSubmit(event, errors, values)} >
          {this.props.buttonText}
        </button>
        <div className={styles.error}>{this.props.formError}</div>
        <div className={styles.success}>{this.props.formSuccess}</div>

      </div>
    )
  }

  getInputsToUse() {
    const values = this.props.inputState.values;
    const errors = this.props.inputState.errors;

    let inputsToUse = this.props.inputsToUse.map((input, i) => {
      switch (input) {
        case 'name':
          return (
            <div key={i} className={styles.inputCol}>
              <InputStacked
                type="text"
                name="name"
                value={values.name}
                errorMsg={errors.name}
                label="Asset Name"
                validateBy="required"
                handleChange={this.props.handleChange}
                />
            </div>
          );
          case 'kind':    // [TODO:DGOLDS] change to be a picker
            return (
              <div key={i} className={styles.inputCol}>
                <AssetKindChooser
                  value={values.kind}
                  errorMsg={errors.kind}
                  handleChange={this.props.handleChange}
                  />
              </div>
            );
        case 'text':    // [TODO:DGOLDS] change to be content
          return (
            <div key={i} className={styles.inputCol}>
              <InputStacked
                type="text"
                name="text"
                value={values.text}
                errorMsg={errors.text}
                label="Asset content"
                validateBy="required"
                handleChange={this.props.handleChange}
                placeholder="Asset content"
                />
            </div>
          );
      }
    });
    return inputsToUse
  }
}
