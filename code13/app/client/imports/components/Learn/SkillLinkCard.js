import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Card, Grid, Header, Icon, Label, List, Popup, Progress } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import QLink from '/client/imports/routes/QLink'
import { startSkillPathTutorial } from '/client/imports/routes/App'
import { getFriendlyName } from '/imports/Skills/SkillNodes/SkillNodes'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const imageStyle = {
  margin: 'auto',
  maxHeight: '100%',
  maxWidth: '100%',
}

class SkillLinkCard extends Component {
  static propTypes = {
    to: PropTypes.string,
    mascot: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    completed: PropTypes.bool,
    started: PropTypes.bool,
    skillPath: PropTypes.string,
    childSkills: PropTypes.arrayOf(PropTypes.string),
    learnedSkills: PropTypes.arrayOf(PropTypes.string),
    todoSkills: PropTypes.arrayOf(PropTypes.string),
    handleDoItAgainClick: PropTypes.func,
  }

  state = {}

  isCompleted = () => {
    const { completed, todoSkills } = this.props
    return !_.isNil(completed) ? completed : _.get(todoSkills, 'length') === 0
  }

  isStarted = () => {
    const { started, learnedSkills } = this.props
    return !_.isNil(started) ? started : _.get(learnedSkills, 'length') > 0
  }

  handleClick = () => {
    const { skillPath, todoSkills, disabled, to } = this.props

    // cards with links already have a path, skip on to
    if (!!to || disabled || this.isCompleted()) return

    startSkillPathTutorial(skillPath + '.' + todoSkills[0])
  }

  handleMouseEnter = () => this.setState({ isHovering: true })
  handleMouseLeave = () => this.setState({ isHovering: false })

  handlePopupOpen = () => this.setState({ showPopup: true })
  handlePopupClose = () => this.setState({ showPopup: false })

  handleDoItAgainClick(skillPath) {
    this.setState({ isHovering: false, showPopup: false })
    startSkillPathTutorial(skillPath)
  }

  renderProgressBar = () => {
    const { childSkills, learnedSkills } = this.props
    if (this.isCompleted() || !this.isStarted() || _.isEmpty(childSkills) || _.isEmpty(learnedSkills))
      return null

    return (
      <Progress
        active
        size="tiny"
        color="yellow"
        percent={Math.round(100 * learnedSkills.length / childSkills.length)}
      />
    )
  }

  renderShowCompleted = () => {
    const { user, childSkills, skillPath } = this.props
    const { isHovering, showPopup } = this.state

    if (_.isEmpty(childSkills) || !this.isCompleted()) return

    return (
      <Popup
        trigger={
          <Button basic floated="right" style={{ transition: 'opacity 0.2s', opacity: +!!isHovering }}>
            Show Completed
          </Button>
        }
        position="left center"
        hoverable
        open={showPopup}
        closeOnTriggerBlur={false}
        onOpen={this.handlePopupOpen}
        onClose={this.handlePopupClose}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <Header sub dividing textAlign="center">
          Do it again
        </Header>
        <List selection>
          {_.map(childSkills, skillLeafKey => (
            <List.Item
              key={skillLeafKey}
              onClick={e => {
                if (this.props.handleDoItAgainClick) {
                  this.props.handleDoItAgainClick(e, skillPath + '.' + skillLeafKey, user)
                  this.setState({ isHovering: false, showPopup: false })
                } else {
                  this.handleDoItAgainClick(skillPath + '.' + skillLeafKey)
                }
              }}
            >
              <Icon name="refresh" />
              <List.Content>
                <List.Header as="a">{getFriendlyName(skillPath + '.' + skillLeafKey)}</List.Header>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </Popup>
    )
  }

  render() {
    const { to, mascot, name, description, disabled, childSkills, learnedSkills } = this.props

    const completed = this.isCompleted()
    const started = this.isStarted()

    const cardStyle = completed
      ? { background: 'none', boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)' }
      : null

    const imageColumnStyle = {
      display: 'flex',
      height: completed ? 70 : 120,
      flex: '0 0 120px',
    }

    const unhandledProps = _.pick(
      this.props,
      _.difference(_.keys(this.props), _.keys(SkillLinkCard.propTypes)),
    )
    return (
      <Card
        {...unhandledProps}
        as={!disabled && to && !completed ? QLink : 'div'}
        to={!disabled && to}
        fluid
        style={{ ...cardStyle, ...unhandledProps.style }}
        link={!completed && !disabled}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.props.onClick || this.handleClick}
        onMouseUp={this.props.onMouseUp}
        onTouchEnd={this.props.onTouchEnd}
      >
        <Card.Content>
          <Grid columns="equal" verticalAlign="middle">
            <Grid.Column style={imageColumnStyle} textAlign="center">
              {completed ? (
                <Icon
                  size={completed ? 'large' : 'big'}
                  name="checkmark"
                  color="green"
                  style={{ margin: 'auto' }}
                />
              ) : (
                <img src={UX.makeMascotImgLink(mascot)} style={imageStyle} />
              )}
            </Grid.Column>
            <Grid.Column>
              <Header as={completed ? 'h2' : 'h1'}>
                {name}
                {!completed && <Header.Subheader>{description}.</Header.Subheader>}
              </Header>
            </Grid.Column>
            {!disabled && (
              <Grid.Column width={started ? 6 : 4} textAlign="right">
                {completed ? (
                  this.renderShowCompleted()
                ) : (
                  <Label
                    basic={!started}
                    size="big"
                    color={started ? 'yellow' : 'grey'}
                    content={started ? 'Continue' : 'Start'}
                    detail={started ? `${learnedSkills.length} / ${childSkills.length}` : null}
                  />
                )}
              </Grid.Column>
            )}
          </Grid>
        </Card.Content>

        {this.renderProgressBar()}
      </Card>
    )
  }
}

export default SkillLinkCard
