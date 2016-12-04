import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { design: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

export default {
  $meta: {
    name:           'Design',
    description:    'Represents game and level design skills',
  },
  'gameplay': {
    'is it fun':          C.E,
    'is it interesting':  C.E,
    'is it challenging':  C.E,
    'is it social':       C.E
    // @stanchion.. more here pls?
    //

  },
  
  'the meta': {
    'metagame':         C.E,
    'win bonusses':     C.E,
    'loss penalties':   C.E,
    'ELO':              C.E,
    'ranking':          C.E,
    'matchmaking':      C.E
  },
  
  'game-mechanics': {
    'final-objectives': {
      'win conditions':    C.E,
      'infinite-play':     C.E,
      'game loss':         C.E
    },
    
    
    health:	{
      'initial health':    C.E,
      'max health':        C.E,
      'recovery rates':    C.E,
      'healing':           C.E,
      'max-health boost':  C.E,
      'extra lives':       C.E
    },
      
    combat: {
      'melee':		    C.E,
      'touch-damage': C.E,
      'shots':        C.E,
      'direct-damage':   C.E,
      'splash-damage':   C.E,
      'reflected-damage': C.E
    },
      
    defense: {
      'armor':           C.E,
      'agility':         C.E,
      'stealth':         C.E,
      'invulnerability': C.E 
    },
    
    modifiers: {
      buffs:             C.E,
      debuffs:           C.E
    },
      
    puzzles: { 
      sokoban:           C.E,
      'required-item':   C.E
      // @stanchion.. more here pls
    },
      
    'in-game-rewards': {
      loot:           C.E
      // @stanchion.. more here pls
    }
  },
    
  'level design': {
    'pathing':      C.E,
    'oclusion':     C.E,
    'backtrack':    C.E,
    'secrets':      C.E,
    'bottlenecks':  C.E
      // @stanchion.. more here pls.. what about 'big rooms' ? 
  },
    
  pacing: {
    'progression':  C.E,
    'grinding':     C.E,
    'bosses':       C.E
    // @stanchion.. others?
  } 
}