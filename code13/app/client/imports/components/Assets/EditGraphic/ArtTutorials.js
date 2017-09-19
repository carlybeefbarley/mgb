import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Grid, Segment, Button, Icon, Message, Divider, Header } from 'semantic-ui-react'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'
import SkillNodes, { isArtTutorial } from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from '/client/imports/routes/QLink'
import { learnSkill } from '/imports/schemas/skills'

export default class ArtTutorial extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    skillPath: PropTypes.string,
    userSkills: PropTypes.object,
    active: PropTypes.bool,
    quickSave: PropTypes.func,
    images: PropTypes.func,
    assetId: PropTypes.string,
    style: PropTypes.object,
    isOwner: PropTypes.bool,
    frameData: PropTypes.array,
    handleSelectFrame: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = props.skillPath.split('art.').pop()
    this.isArtTutorial = isArtTutorial(props.skillPath)

    this.state = {
      step: 0, // curent step of tutorial
      isCompleted: false, // indicator if current tutorial is completed and we need to show modal
      isTaskSubmitted: false, // indicator if task is submitted and we need to show modal
      data: {}, // will get from CDN
    }
    mgbAjax(`/api/asset/code/!vault/` + this.skillName, (err, listStr) => {
      if (err) console.log('error', err)
      else this.setState({ data: JSON.parse(listStr) })
    })
  }

  stepNext = () => {
    const step = this.state.step + 1
    if (step < this.state.data.steps.length) {
      if (this.props.frameData[step]) this.props.handleSelectFrame(step)
      this.setState({ step })
    } else this.successPopup()
    ga('send', 'pageview', this.props.skillPath)
  }

  stepBack = () => {
    if (this.state.step > 0) {
      const step = this.state.step - 1
      if (this.props.frameData[step]) this.props.handleSelectFrame(step)
      this.setState({ step })
    }
  }

  successPopup = () => {
    learnSkill(this.props.skillPath)
    this.setState({ isCompleted: true })
  }

  navigateToSkillsList = () => {
    const returnToSkillsUrl = '/learn/art/'
    utilPushTo(null, returnToSkillsUrl)
  }

  render() {
    const currStep = this.state.data.steps ? this.state.data.steps[this.state.step] : null
    const description = currStep ? currStep.text : ''
    const source = currStep ? currStep.source : ''
    const images = currStep ? currStep.images : []
    const totalSteps = this.state.data.steps ? this.state.data.steps.length : 0
    const isLastStep = totalSteps > 0 && this.state.step == totalSteps - 1
    const { isCompleted } = this.state

    return (
      <Grid.Column style={{ height: '100%' }} width={8}>
        <Segment style={{ width: '100%' }}>
          <Button
            compact
            size="small"
            color="green"
            onClick={this.stepBack}
            icon="backward"
            content="Back"
            disabled={this.state.step === 0 || isCompleted}
          />
          <Button
            compact
            size="small"
            color="green"
            onClick={this.stepNext}
            icon="forward"
            content={isLastStep ? 'Finish' : 'Next'}
            disabled={isCompleted}
          />
          <Button
            compact
            basic
            size="small"
            color="green"
            onClick={this.navigateToSkillsList}
            icon="up arrow"
            data-position="bottom right"
            data-tooltip="Go up to Tutorial list"
          />

          <Divider as={Header} color="grey" size="tiny" horizontal>
            {this.state.data.title}
          </Divider>

          {isCompleted && (
            <Message size="small" icon style={{ paddingBottom: 0 }}>
              <Icon color="green" name="check circle" />
              <Message.Content>
                <Message.Header>Completed...</Message.Header>
                <Button
                  positive
                  size="small"
                  content="Return to Tutorial List"
                  icon="up arrow"
                  labelPosition="right"
                  style={{ margin: '1em 1em 1em 0' }}
                  onClick={this.navigateToSkillsList}
                />
              </Message.Content>
            </Message>
          )}
          <Segment style={{ marginBottom: 0 }} basic textAlign="center">
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
              {_.map(images, (img, i) => {
                return (
                  <img
                    key={i}
                    style={{ padding: '0px 10px 0px 10px', height: '175px', width: 'auto' }}
                    src={img}
                  />
                )
              })}
            </div>
          </Segment>
          <a style={{ cursor: 'pointer' }} href={source.split('::').pop()} target="_blank">
            <Header style={{ padding: 0, textAlign: 'center' }} size="tiny" disabled>
              Source: {source.split('::')[0]}
            </Header>
          </a>
          <Segment style={{ marginTop: 0 }} basic>
            <p dangerouslySetInnerHTML={{ __html: description }} />
          </Segment>
        </Segment>
      </Grid.Column>
    )
  }
}
