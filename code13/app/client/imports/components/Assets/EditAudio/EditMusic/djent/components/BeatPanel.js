import React, { Component } from 'react'

import AllowedLengthsController from './AllowedLengthsController'
import BeatsController from './BeatsController'
import HitChanceController from './HitChanceController'

class BeatPanel extends Component {
  onHitChanceChange = event => {
    const hitChance = parseInt(event.target.value)
    this.props.actions.updateHitChance(hitChance)
  }

  render() {
    // console.log(this.props.hitChance)
    const allowedLengths = this.props.preset.settings.config.allowedLengths
    const hitChance = this.props.preset.settings.config.hitChance
    const beat = this.props.beat

    allowedLengths.sort((a, b) => a.id > b.id)

    return (
      <div>
        <h3>Randomised beat settings</h3>

        <AllowedLengthsController
          actions={{ updateAllowedLengths: this.props.actions.updateAllowedLengths }}
          allowedLengths={allowedLengths}
        />

        <div style={{ clear: 'both' }}>&nbsp;</div>

        <div className="row">
          <HitChanceController
            beatID={beat.id}
            hitChance={hitChance}
            actions={{ updateHitChance: this.props.actions.updateHitChance }}
          />

          <BeatsController beat={beat} actions={{ updateBeats: this.props.actions.updateBeats }} />
        </div>
      </div>
    )
  }
}

export default BeatPanel
