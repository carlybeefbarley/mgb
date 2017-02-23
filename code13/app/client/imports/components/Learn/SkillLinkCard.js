import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { Card, Grid, Header, Icon, Label, Progress } from 'semantic-ui-react'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import QLink from '/client/imports/routes/QLink'
import { startSkillPathTutorial } from '/client/imports/routes/App'

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
    completed: PropTypes.bool,
    started: PropTypes.bool,
    skillPath: PropTypes.string,
    childSkills: PropTypes.arrayOf( PropTypes.string ),
    learnedSkills: PropTypes.arrayOf( PropTypes.string ),
    todoSkills: PropTypes.arrayOf( PropTypes.string ),
  }

  isCompleted = () => {
    const { completed, todoSkills } = this.props
    return !_.isNil( completed ) ? completed : _.get( todoSkills, 'length' ) === 0
  }

  isStarted = () => {
    const { started, learnedSkills } = this.props
    return !_.isNil( started ) ? started : _.get( learnedSkills, 'length' ) > 0
  }

  handleClick = () => {
    const { skillPath } = this.props

    if (this.isCompleted())
      return

    startSkillPathTutorial( skillPath )
  }

  renderProgressBar = () => {
    const { childSkills, learnedSkills } = this.props
    if (this.isCompleted() || !this.isStarted() || _.isEmpty( childSkills ) || _.isEmpty( learnedSkills ))
      return null

    return <Progress active size='tiny' color='yellow' value={learnedSkills.length} total={childSkills.length} />
  }

  render() {
    const {
      to,
      mascot,
      name,
      description,
      childSkills,
      learnedSkills,
    } = this.props

    const completed = this.isCompleted()
    const started = this.isStarted()

    const cardStyle = completed
      ? { background: 'none', boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)' }
      : null

    const imageColumnStyle = {
      display: 'flex',
      height: completed ? 100 : 120,
      flex: '0 0 120px',
    }

    const unhandledProps = _.pick(
      this.props,
      _.difference( _.keys( this.props ), _.keys( SkillLinkCard.propTypes ) )
    )

    return (
      <Card
        {...unhandledProps}
        as={to && !completed ? QLink : 'div'}
        to={to}
        fluid
        style={{ ...cardStyle, ...unhandledProps.style }}
        // TODO @levi after upgrading to SUIR 0.66, use link prop
        // link={!isCompleted}
        className={completed ? '' : 'link'}
        onClick={this.handleClick}
      >
        <Card.Content>
          <Grid columns='equal' verticalAlign='middle'>
            <Grid.Column style={imageColumnStyle} textAlign='center'>
              {completed
                ? <Icon size='big' name='checkmark' color='green' style={{ margin: 'auto' }} />
                : <img src={makeCDNLink( `/images/mascots/${mascot}.png` )} style={imageStyle} />
              }
            </Grid.Column>
            <Grid.Column>
              <Header as={completed ? 'h2' : 'h1'}>
                {name}
                {!completed && <Header.Subheader>{description}.</Header.Subheader>}
              </Header>
            </Grid.Column>
            {!completed && (
              <Grid.Column width={4} textAlign='right'>
                <div>
                  <Label
                    basic={!started}
                    horizontal
                    size='huge'
                    color={started ? 'yellow' : 'grey'}
                    content={started ? 'Continue' : 'Start'}
                    detail={started ? `${learnedSkills.length} / ${childSkills.length}` : null}
                  />
                </div>
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
