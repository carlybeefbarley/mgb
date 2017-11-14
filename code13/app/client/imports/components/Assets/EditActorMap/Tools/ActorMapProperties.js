import React from 'react'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import NumberInput from '/client/imports/components/Controls/NumberInput'

export default class ActorMapProperties extends React.Component {
  constructor(...args) {
    super(...args)
  }

  componentDidMount() {}

  render() {
    return (
      <div id="mgbjr-MapTools-properties">
        <div className="ui small labeled input">
          <div className="ui small label" title="Map width">
            w:
          </div>
          <NumberInput
            disabled={this.props.isPlaying}
            className="ui small input"
            min={1}
            max={300}
            style={{ width: '6em' }}
            value={this.props.data.width}
            onFinalChange={num => {
              this.props.resize({ width: num, height: this.props.data.height })
            }}
          />
        </div>

        <span>&nbsp;&nbsp;</span>
        <div className="ui small labeled input">
          <div className="ui small label" title="Map height">
            h:
          </div>
          <NumberInput
            disabled={this.props.isPlaying}
            className="ui small input"
            min={1}
            max={300}
            style={{ width: '6em' }}
            value={this.props.data.height}
            onFinalChange={num => {
              this.props.resize({ width: this.props.data.width, height: num })
              joyrideCompleteTag(`mgbjr-CT-MapTools-properties-resizeHeight`)
            }}
          />
        </div>
      </div>
    )
  }
}
