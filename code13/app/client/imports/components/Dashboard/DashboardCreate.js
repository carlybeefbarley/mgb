import React, { PropTypes } from 'react'
import { Button, Icon, Segment, Grid, List, Dropdown } from 'semantic-ui-react'
import { defaultAssetViewChoice } from '/client/imports/components/Assets/AssetCard'
import AssetList from '/client/imports/components/Assets/AssetList'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import ProjectsBeingMadeGET from '/client/imports/components/Projects/ProjectsBeingMadeGET'
import QLink from '/client/imports/routes/QLink'

import sty from  './dashboard.css'

// console.log(assetViewChoices, defaultAssetViewChoice)


export default class DashboardCreate extends React.Component {

/** NOT YET USED */
  render() {
    const { assets, currUser, userSkills } = this.props
    return (
      <Grid columns={16}>

        <Grid.Row stretched>
          <Grid.Column width={8}>
            <Segment>
              <b>Filtered assets</b><br/>
              { assets &&
                <AssetList
                  allowDrag={true}
                  fluid={false}
                  renderView={defaultAssetViewChoice}
                  assets={assets}
                  currUser={currUser}
                />
              }
            </Segment>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment>
              <b>Engagement (likes/comments/chat mentions)</b>
               <List>
                <List.Item>Kate liked code asset</List.Item>
              </List>
            </Segment>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment>
              <b>Project Test activities</b>
              <List>
                <List.Item>Bob delete asset bg.png</List.Item>
                <List.Item>Jane created new graphic asset char</List.Item>
                <List.Item>Bob modified code.js</List.Item>
                <List.Item>Bob delete asset bg.png</List.Item>
                <List.Item>Jane created new graphic asset char</List.Item>
                <List.Item>Bob modified code.js</List.Item>
                <List.Item>Bob delete asset bg.png</List.Item>
                <List.Item>Jane created new graphic asset char</List.Item>
                <List.Item>Bob modified code.js</List.Item>
                <List.Item>Bob delete asset bg.png</List.Item>
                <List.Item>Jane created new graphic asset char</List.Item>
                <List.Item>Bob modified code.js</List.Item>
              </List>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row stretched>
          <Grid.Column width={8}>
            <Segment>
              <b>Coding skills</b><br/>
              <div>Skills completed <span style={{fontSize:'32px'}}>32</span>, &nbsp;&nbsp;&nbsp; skills to complete <span style={{fontSize:'32px'}}>156</span>, &nbsp;&nbsp;&nbsp; go to <Button primary>Next Skill</Button></div>
              {
                userSkills &&
                <SkillsMap skills={userSkills} skillPaths={['code.js']} expandable toggleable />
              }
            </Segment>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment>
              <b>Useful links</b>
              <List>
                <List.Item><QLink to={`/games`}>First link</QLink></List.Item>
                <List.Item><QLink to={`/games`}>Second link</QLink></List.Item>
                <List.Item><QLink to={`/games`}>Third link</QLink></List.Item>
              </List>
            </Segment>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment>
              <b>Useful links2</b>
              <List>
                <List.Item><QLink to={`/games`}>First link</QLink></List.Item>
                <List.Item><QLink to={`/games`}>Second link</QLink></List.Item>
                <List.Item><QLink to={`/games`}>Third link</QLink></List.Item>
              </List>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row stretched>
          <Grid.Column width={16}>
            <Segment>
              <b>Liked games</b><br/>
              <ProjectsBeingMadeGET numEntries={6} chosenClassName="ui inverted very relaxed horizontal list" />
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row stretched>
          <Grid.Column width={4}>
            <Segment>
              <b>TODO list</b><br/>
              <List>
                <List.Item>First task</List.Item>
                <List.Item>Second task</List.Item>
                <List.Item>Third task</List.Item>
              </List>
            </Segment>
          </Grid.Column>
          <Grid.Column width={4}>
            <Segment>
              <b>MGB Announcements</b><br/>
              ActorMap game improvements
              The buttons for the actorMap game player have been simplified and have better help text. Frame rate is now locked to 30fps. Fixed bug with melee repeat modifier
            </Segment>
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment>

            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
