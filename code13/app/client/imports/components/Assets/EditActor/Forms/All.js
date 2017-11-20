import _ from 'lodash'
import React from 'react'
import { Grid, Form } from 'semantic-ui-react'
import BaseForm from '../../../Controls/BaseForm.js'
import actorOptions from '../../Common/ActorOptions.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'
import templates from '../TemplateDiffs.js'

export default class All extends BaseForm {
  get data() {
    return this.props.asset.content2.databag.all
  }

  // Should other data be reset?
  // reload correct template
  handleChangeActorType = databag => () => {
    // Set correct itemActivationType when actorType is changed
    const { itemActivationType } = databag.item

    switch (parseInt(databag.all.actorType)) {
      case 4:
        databag.item.itemActivationType = itemActivationType !== '0' ? '0' : itemActivationType
        break
      case 5:
        databag.item.itemActivationType = !_.includes([4, 5, 6, 7], +itemActivationType)
          ? '4'
          : itemActivationType
        break
      case 6:
        databag.item.itemActivationType = !_.includes([1, 2, 3], +itemActivationType)
          ? '3'
          : itemActivationType
        break
      case 7:
        databag.item.itemActivationType = !_.includes([0, 8, 9], +itemActivationType)
          ? '0'
          : itemActivationType
        break
    }

    const idx = +databag.all.actorType
    const template = _.find(actorOptions.actorType, idx)

    _.forEach(template, (val, key) => {
      databag[key] = _.merge(template[key], databag[key])
    })

    // TODO I think this should be persisting to the server?? if not , how/when is databag persisted by this mutation?
    this.forceUpdate()
  }

  updateActorThumbnail = () => asset => {
    if (!asset) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      this.props.saveThumbnail(canvas.toDataURL())
    }
    img.onerror = e => console.error('Failed to update Actor image', e)
    img.src = Thumbnail.getLink(asset)
  }

  render() {
    const soundOptions = {
      options: MgbActor.alCannedSoundsList.map(s => ({ text: '[builtin]:' + s, value: '[builtin]:' + s })),
    }
    // Handle limiting InitialHealth < initialMaxHealthNum
    let initHealthConfig = { min: 1, max: 1000000, default: 1 }
    if (this.data.initialMaxHealthNum) {
      const max = parseInt(this.data.initialMaxHealthNum, 10)
      if (max > 0) initHealthConfig.max = max
    }
    const databag = this.props.asset.content2.databag
    const actorType = databag.all.actorType

    return (
      <Grid style={{ minHeight: '50vh' }} centered container>
        <Grid.Column>
          <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
            {this.options(
              'Actor Type',
              'actorType',
              _.pickBy(actorOptions.actorType, (val, key) => {
                return key !== 'Item, Wall, or Scenery'
              }),
              {},
              'mgbjr-CT-edit-actor-actorType',
              'mgbjr-edit-actor-actorType',
              this.handleChangeActorType(databag),
            )}
            {this.text('Description', 'description')}
            {this.text('Initial Heath', 'initialHealthNum', 'number', initHealthConfig)}
            {this.text('Initial Max Health', 'initialMaxHealthNum', 'number', {
              min: 0,
              max: 1000000,
              default: 0,
              title: 'This is the highest health the actor can have. The value 0 means there is no limit',
            })}
            {this.dropArea(
              'Graphic',
              'defaultGraphicName',
              'graphic',
              null,
              this.updateActorThumbnail(this.props.asset),
            )}
            {this.dropArea('Sound When Harmed', 'soundWhenHarmed', 'sound', soundOptions)}
            {this.dropArea('Sound When Healed', 'soundWhenHealed', 'sound', soundOptions)}
            {this.dropArea('Sound When Killed', 'soundWhenKilled', 'sound', soundOptions)}
          </Form>
        </Grid.Column>
      </Grid>
    )
  }
}
