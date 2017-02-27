import _ from 'lodash'
import React, { Component } from "react";
import { Form, Popup, Button } from "semantic-ui-react";

class ResizeImageDialog extends Component {
  state = {
    scaling: "None",    // Hack. Should really be set from props.sclingOptions[0]
    newWidth: null,
    newHeight: null
  };

  handleChangeScaling = (e, { value }) => this.setState({ scaling: value });
  handleChangeWidth = (e, { value }) => this.setState({ newWidth: parseInt(value, 10) });
  handleChangeHeight = (e, { value }) => this.setState({ newHeight: parseInt(value,10) });
  handleSubmit = e => {
    const { newWidth, newHeight, scaling } = this.state;
    e.preventDefault();
    this.props.handleResize(newWidth, newHeight, scaling)
  };

  render() {
    const { initialWidth, initialHeight, maxWidth, maxHeight, scalingOptions } = this.props;
    const { newWidth, newHeight, scaling } = this.state;
    const isNotValid = newWidth < 1 || newHeight < 1;
    const makeSticky = newWidth || newHeight

    return (
      <Popup
        flowing
        hoverable
        mouseEnterDelay={250}
        on="hover"
        closeOnPortalMouseLeave={!makeSticky}
        closeOnTriggerMouseLeave={!makeSticky}
        positioning="bottom left"
        trigger={
          (
            <Button
              size="small"
              id="mgbjr-EditGraphic-resizeButton"
              content={`${initialWidth} x ${initialHeight}`}
            />
          )
        }
      >
        <Popup.Header>
          Resize Canvas
        </Popup.Header>
        <Popup.Content>
          <Form error>
            <Form.Group>
              <Form.Input
                inline
                label="Width"
                placeholder={initialWidth}
                type="number"
                style={{width: '120px'}}
                min={1}
                max={maxWidth}
                onChange={this.handleChangeWidth}
              />
              <Form.Input
                inline
                label="Height"
                placeholder={initialHeight}
                type="number"
                style={{width: '120px'}}
                min={1}
                max={maxHeight}
                onChange={this.handleChangeHeight}
              />
            </Form.Group>
            <Form.Group inline>
              <label>Image Scaling </label>
              { _.map(scalingOptions, s => 
                <Form.Radio
                  key={s}
                  label={s}
                  value={s}
                  checked={scaling === s}
                  onChange={this.handleChangeScaling}
                />
              )}
            </Form.Group>
            <Form.Button disabled={isNotValid} onClick={this.handleSubmit}>
              Resize
            </Form.Button>
          </Form>
        </Popup.Content>
      </Popup>
    );
  }
}

export default ResizeImageDialog;
