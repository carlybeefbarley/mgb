import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Header, Card } from 'semantic-ui-react'
import TemplateCard from '/client/imports/components/Assets/NewAsset/TemplateCard.js'

const _templates = [
  {
    id: 'dqob2JxcxB5xxcyYx',
    name: 'Basic',
    description:
      'Most basic version of game. Draws background and one sprite. Introduces concepts of Phaser preload() and create()',
    imageId: 'DMSrF2zbp7ZFE4oeY',
  },
  {
    id: '7fHDXhpDMxp3L8zcC',
    name: 'Whack a Mole',
    description: 'Simple mole game. Includes concepts: sprites, mouse events, custom functions',
    imageId: 'gbwca5zKJ7JkiWRWz',
  },
  {
    id: 'qL52v8n67jHrAr2E8',
    name: 'Pacman',
    description:
      'Classical pacman game simplified. Introduces collision detection, restarting game, random enemy AI',
    imageId: 'CJd8uJh44NEcQF95g',
  },
  {
    id: 'kz3L8TKwKsHPHAssj',
    name: 'Platformer',
    description:
      'Basic platformer game. Concepts: physics, gravity, collision detection, isTouching, keyboard events, animated sprites',
    imageId: 'MMekQ5uGiSbuq4vY4',
  },
  {
    id: 'CsGcESFSyqhcXAR5n',
    name: 'Asteroids',
    description:
      'Simplified asteroids game. Introduces: creating numerous objects, groups, collision between groups, destroying sprites',
    imageId: 'gcJNj9t6JS4W7pygv',
  },
  {
    id: 'rx9iydpyuTghQZSXs',
    name: 'Match3',
    description: 'A bit more complicated game. Heavy use of arrays, 2 dimensional arrays, tweens',
    imageId: '559ycE4fsiGnyhzXR',
  },
  {
    id: 'kz3L8TKwKsHPHAssj',
    name: 'Flappy Bird',
    description: 'Dynamic generation of platforms',
    imageId: '24BLSoffcyJe5aZWX',
  },
  {
    id: 'zyjbN7d2f2bBBxP2c',
    name: 'Maps',
    description: 'Load predefined maps, change maps, collision detection in maps',
    imageId: 'cRaPtHDzgncmargsy',
  },
]

const AssetFromTemplate = React.createClass({
  propTypes: {
    currUser: PropTypes.object, // currently logged in user (if any)
  },

  render() {
    return (
      <div>
        <Header as="h2" content="Create Asset from Template" />
        <Card.Group>
          {_.map(_templates, template => (
            <TemplateCard
              key={template.id}
              codeAssetId={template.id}
              name={template.name}
              description={template.description}
              imageId={template.imageId}
              currUser={this.props.currUser}
            />
          ))}
        </Card.Group>
      </div>
    )
  },
})

export default AssetFromTemplate
