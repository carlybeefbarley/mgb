import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal, Icon, List, Segment, Popup, Divider, Header } from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from "/client/imports/routes/QLink"
import { learnSkill } from '/imports/schemas/skills'

// TODO make this dynamic
import tutorialObject from '/public/codeTutorials.json'


import './editcode.css'


const _jsGamesSkillsPath = 'code.js.games'
const _jsGamesSkillsNode = SkillNodes.$meta.map[_jsGamesSkillsPath]


export default class CodeTutorials extends React.Component {

  static propTypes = {
    currUser:    PropTypes.object,
    skillPath:   PropTypes.string,
    userSkills:  PropTypes.object,
    codeMirror:  PropTypes.object,
    active:      PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.state = {
      
    }
  }

  componentDidMount() {
    const tutorialUrl = makeCDNLink(window.location.origin + this.skillNode.$meta.link) 
    // console.log(tutorialUrl, this.skillNode)

    console.log(tutorialObject)
  }


  render() {
    const description = this.skillNode.$meta.description
    const { showAllTestsCompletedModal } = this.state

    return (
      <div id="codeChallenges" className={"content " +(this.props.active ? "active" : "")}>
        Code Tutorials soon to be implemented
      </div>
    )
  }

}