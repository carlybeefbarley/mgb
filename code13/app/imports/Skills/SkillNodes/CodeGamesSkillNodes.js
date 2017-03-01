import C from './CommonSkillNodes'

// skillnodes for game tutorials

export default {
  $meta: {
    name:           'Game tutorials',
    description:    ''
  },
  'mole1': {
    $meta: {
      name: 'Whack a Mole Nr1',
      icon: 'code',
      link: '/api/asset/tutorial/!vault:tutorials.game.basics.mole.1',
      description: `First game from series`,
    },
    'mole1': C.En(0)
  }
}