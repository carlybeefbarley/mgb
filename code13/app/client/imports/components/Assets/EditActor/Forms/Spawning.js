import React from 'react'
import { Grid, Form } from 'semantic-ui-react'
import BaseForm from '../../../Controls/BaseForm.js'

import { withStores } from '/client/imports/hocs'
import { videoStore } from '/client/imports/stores'
import VideoPopup from '/client/imports/components/Video/VideoPopup'

class Spawning extends BaseForm {
  componentWillMount() {
    const { videoStore } = this.props
    videoStore.getComponentName(this.constructor.name)
  }

  get data() {
    return this.props.asset.content2.databag.itemOrNPC
  }

  render() {
    const { videoStore: { state: { videos } } } = this.props

    return (
      <div>
        <Grid style={{ minHeight: '50vh' }} centered container>
          <Grid.Column>
            <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
              <div id="mgbjr-edit-actor-DestructionSpawning-points">
                {this.options('Respawn options', 'respawnOption', [
                  { text: 'Respawn on map reload', value: '0' },
                  { text: 'Never respawn', value: '1' },
                ])}
                {this.dropArea('Randomly generates new actor', 'dropsObjectRandomlyName', 'actor')}
                {this.text('% chance of randomly generating actor', 'dropsObjectRandomlyChance', 'number', {
                  min: 1,
                  max: 100,
                  title:
                    "% chance of randomly generating actor '" +
                    this.data.dropsObjectRandomlyName +
                    "' each second",
                  default: 0,
                })}
                {this.bool('Can be destroyed/damaged', 'destroyableYN')}
                {this.text(
                  'Points scored (or lost) when shot by player',
                  'scoreOrLosePointsWhenShotByPlayerNum',
                  'number',
                  {
                    default: 0,
                    disabled: this.data.destroyableYN == '0',
                  },
                )}
                {this.text(
                  'Points scored (or lost) when killed by player',
                  'scoreOrLosePointsWhenKilledByPlayerNum',
                  'number',
                  {
                    min: -1000000,
                    max: 1000000,
                    default: 0,
                    disabled: this.data.destroyableYN == '0',
                  },
                )}
                {this.dropArea(
                  'Drops (creates) new actor when destroyed',
                  'dropsObjectWhenKilledName',
                  'actor',
                  {
                    default: 0,
                    disabled: this.data.destroyableYN == '0',
                  },
                )}
                {this.data.dropsObjectWhenKilledName &&
                  this.text('% Chance of drop happening', 'dropsObjectWhenKilledChance', 'number', {
                    min: 1,
                    max: 100,
                    default: 100,
                    disabled: this.data.destroyableYN == '0',
                  })}
              </div>

              <div id="mgbjr-edit-actor-DestructionSpawning-spawn">
                {this.dropArea(
                  'Drops (creates) new actor #2 when destroyed',
                  'dropsObjectWhenKilledName2',
                  'actor',
                  {
                    default: 0,
                    disabled: this.data.destroyableYN == '0',
                  },
                )}
                {this.data.dropsObjectWhenKilledName2 &&
                  this.text('% Chance of drop #2 happening', 'dropsObjectWhenKilledChance2', 'number', {
                    min: 1,
                    max: 100,
                    title:
                      'This % chance is independent of drop #1 - so if both are 100% then there will always be two actors dropped. The first dropped item will be in the top-left corner of where the destroyed actor was. The 2nd drop, if it happens will be next to where the destroyed actor was, placed based on the direction the destroyed actor had been facing',
                    disabled: this.data.destroyableYN == '0',
                  })}
              </div>
            </Form>
          </Grid.Column>
        </Grid>
        {videos && <VideoPopup />}
      </div>
    )
  }
}

export default withStores({ videoStore })(Spawning)
