import React from 'react'
import { Grid, Form } from 'semantic-ui-react'
import BaseForm from '../../../Controls/BaseForm.js'
import actorOptions from '../../Common/ActorOptions.js'

export default class All extends BaseForm {
  get data() {
    return this.props.asset.content2.databag.itemOrNPC
  }

  render() {
    return (
      <Grid style={{ minHeight: '50vh' }} centered container>
        <Grid.Column>
          <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
            <span style={{ color: '#A91313' }}>
              'Conditions' make an actor appear or disappear, depending on how many other actors are on the
              map.
            </span>
            <div className="allInline">
              {
                <span style={{ verticalAlign: 'middle', padding: '5px' }}>
                  {this.options('', 'appearIf', actorOptions.appearIf)}
                </span>
              }
              {this.data.appearIf != '0' && <span style={{ padding: '5px' }}>if</span>}
              {this.data.appearIf != '0' && (
                <span style={{ verticalAlign: 'middle', padding: '5px' }}>
                  {this.text('', 'appearCount', 'number', { default: 0 })}
                </span>
              )}
              {
                <span style={{ verticalAlign: 'middle', marginBottom: '10px', padding: '5px' }}>
                  {this.data.appearIf != '0' && this.dropArea('', 'conditionsActor', 'actor')}
                </span>
              }
              {this.data.appearIf != '0' && <span>actors are on current map</span>}
            </div>
          </Form>
        </Grid.Column>
      </Grid>
    )
  }
}
