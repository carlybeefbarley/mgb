import React from 'react'
import ActorHelper from '../Common/Map/Helpers/ActorHelper'
import DropArea from '/client/imports/components/Controls/DropArea'
import { List, Icon, Button, Segment, Container } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

export default class extends React.Component {
  static propTypes = {
    errors: React.PropTypes.array.isRequired, // array with errors reported by ActorHelper
    callback: React.PropTypes.func.isRequired, // callback after some changes has been made - usually it will be re-check function
    content2: React.PropTypes.object.isRequired, // reference to content2
  }
  errorHandlers = {
    [ActorHelper.errorTypes.MISSING_ACTOR]: (err, i) => (
      <Segment key={i} as="div">
        <Container>
          <Icon color="orange" size="large" name="warning sign" />Unable to locate actor <em>{err.actor}</em>
        </Container>
        <Segment.Group horizontal>
          <Segment>
            <Button
              color="red"
              onClick={() => {
                const tilesetIndex = this.props.content2.meta.tilesets.findIndex(tileset => {
                  return tileset.name == err.actor
                })
                // remove tileset
                this.props.content2.meta.tilesets.splice(tilesetIndex, 1)
                // remove actor tiles
                this.props.content2.mapLayer.forEach(d => {
                  d.forEach((actor, i) => {
                    if (actor == err.actor) {
                      d[i] = ''
                    }
                  })
                })
                // 3. call the callback
                this.props.callback(this.props.content2)
              }}
            >
              Remove Actor from map
            </Button>
          </Segment>
          <Segment>
            <DropArea
              kind="actor"
              text="Drop Actor here to replace missing actor with new one"
              onChange={(val, asset) => {
                console.log('Dropped asset', val, asset)
                // 1. replace name in the tilesets and delete actor?
                const tileset = this.props.content2.meta.tilesets.find(tileset => {
                  return tileset.name == err.actor
                })
                tileset.name = val
                delete tileset.actor // Actor Helper should get new actor by name

                // 2. replace tiles with new name
                this.props.content2.mapLayer.forEach(d => {
                  d.forEach((actor, i) => {
                    if (actor == err.actor) {
                      d[i] = val
                    }
                  })
                })

                // 3. call the callback
                this.props.callback(this.props.content2)
              }}
            />
          </Segment>
        </Segment.Group>
      </Segment>
    ),
    [ActorHelper.errorTypes.MISSING_IMAGE](err, i) {
      const parts = err.actor.split(':')
      const name = parts.pop()
      const user = parts.pop()

      return (
        <Segment key={i} as="div">
          <Container>
            <Icon color="orange" size="large" name="warning sign" />Unable to locate image for an actor{' '}
            <em>{err.actor}</em>
          </Container>
          <Segment>
            <QLink to={`/assetEdit/actor/${user}/${name}`}>
              <Button color="blue">Edit Actor {err.actor}</Button>
            </QLink>
          </Segment>
        </Segment>
      )
    },
  }
  render() {
    return (
      <div className="mgb_error_class">
        <h2>This map contains errors</h2>
        <p>Before you can continue to edit you need to resolve errors</p>
        {this.props.errors.map((err, i) => {
          if (this.errorHandlers[err.error]) {
            return this.errorHandlers[err.error].call(this, err, i)
          } else {
            console.error('Unknow error:', err)
          }
        })}
      </div>
    )
  }
}
