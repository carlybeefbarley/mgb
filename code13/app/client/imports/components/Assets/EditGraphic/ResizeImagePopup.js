import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Form, Popup, Button } from 'semantic-ui-react'

class ResizeImageDialog extends Component {
  state = {
    scaling: 'None', // Hack. Should really be set from props.scalingOptions[0]
    newWidth: null,
    newHeight: null,
  }

  isTooLarge = () => this.state.newWidth > this.props.maxWidth || this.state.newHeight > this.props.maxHeight
  isNotValid = () => this.state.newWidth < 1 || this.state.newHeight < 1 || this.isTooLarge()
  handleChangeScaling = (e, { value }) => this.setState({ scaling: value })
  handleChangeWidth = (e, { value }) => this.setState({ newWidth: parseInt(value, 10) })
  handleChangeHeight = (e, { value }) => this.setState({ newHeight: parseInt(value, 10) })

  handleSubmit = e => {
    e.preventDefault()
    if (this.isNotValid()) return

    const { newWidth, newHeight, scaling } = this.state
    this.props.handleResize(newWidth, newHeight, scaling)
  }

  render() {
    const { initialWidth, initialHeight, maxWidth, maxHeight, scalingOptions } = this.props
    const { newWidth, newHeight, scaling } = this.state
    const makeSticky = newWidth || newHeight

    return (
      <Popup
        flowing
        hoverable
        mouseEnterDelay={250}
        on="hover"
        closeOnPortalMouseLeave={!makeSticky}
        closeOnTriggerMouseLeave={!makeSticky}
        position="bottom left"
        trigger={
          <Button
            id="mgbjr-EditGraphic-resizeButton"
            className="TopToolBarRowIcon"
            content={`${initialWidth} x ${initialHeight}`}
          />
        }
      >
        <Popup.Header>Resize Canvas</Popup.Header>
        <Popup.Content>
          <Form error>
            <Form.Group>
              <Form.Input
                inline
                label="Width"
                placeholder={initialWidth}
                type="number"
                min={1}
                max={maxWidth}
                onChange={this.handleChangeWidth}
              />
              <Form.Input
                inline
                label="Height"
                placeholder={initialHeight}
                type="number"
                min={1}
                max={maxHeight}
                onChange={this.handleChangeHeight}
              />
            </Form.Group>
            <Form.Group inline>
              <label>Image Scaling </label>
              {_.map(scalingOptions, s => (
                <Form.Radio
                  key={s}
                  label={s}
                  value={s}
                  checked={scaling === s}
                  onChange={this.handleChangeScaling}
                />
              ))}
            </Form.Group>
            <Form.Button disabled={this.isNotValid()} onClick={this.handleSubmit}>
              Resize
            </Form.Button>
            {this.isTooLarge() && (
              <small style={{ float: 'right' }}>
                Max size is {maxWidth}x{maxHeight}
              </small>
            )}
          </Form>
        </Popup.Content>
      </Popup>
    )
  }
}

ResizeImageDialog.propTypes = {
  maxWidth: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  initialWidth: PropTypes.number.isRequired,
  initialHeight: PropTypes.number.isRequired,
  scalingOptions: PropTypes.arrayOf(PropTypes.string),
  handleResize: PropTypes.func.isRequired,
}

export default ResizeImageDialog
