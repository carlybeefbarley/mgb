import React from 'react'
import { Divider, Button, Image, Grid, Header } from 'semantic-ui-react'

import HeroLayout from '/client/imports/layouts/HeroLayout'
import QLink from '/client/imports/routes/QLink'
import UX from '/client/imports/UX'
import HoverImage from 'react-hover-image'
import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'

export default class HomePage extends React.Component {
  render() {
    return (
      <HeroLayout
        heroContent={
          <div>
            <Divider hidden />

            <HomeHeroBanner />

            <Divider hidden section />
          </div>
        }
      />
    )
  }
}

// TODO: Refactor to own class inside of HomePageRoute when refactoring class HomePage
class HomeHeroBanner extends React.Component {
  render() {
    const { currUser } = this.props
    const { userId } = this.props

    const mascotColumnStyle = {
      pointerEvents: 'none',
    }
    const gameProgrammingStyle = {
      color: 'black',
      border: '10 px solid orange',
    }

    const headerStyle = {
      fontSize: '3.2em',
      textAlign: 'center',
    }

    const subheaderStyle = {
      color: '#00cc00',
    }

    return (
      <div id="container">
        <Grid verticalAlign="middle" padded>
          <Grid.Row>
            <Grid.Column width={2} />
            <Grid.Column width={5} style={mascotColumnStyle}>
              <Image size="large" centered src={UX.makeMascotImgLink('team')} />
              <Header style={headerStyle} inverted>
                <huge>My Game Builder</huge>
                <Header.Subheader style={subheaderStyle}>
                  <p>Make Games. Make Friends. Have Fun.</p>
                </Header.Subheader>
              </Header>
            </Grid.Column>
            <Grid.Column width={2} />
            <Grid.Column width={5}>
              <Image size="large" centered src={UX.makeMascotImgLink('AIE-logo')} />
            </Grid.Column>
            <Grid.Column width={2} />
          </Grid.Row>
          <Grid.Row />
          <Grid.Row centered>
            {userId ? (
              <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
                Welcome back, {currUser.username}!
                <br />
                Last time you were working on{' '}
                <em>
                  <RecentlyEditedAssetGET userId={userId} />
                </em>.
                <br />
                <Button
                  as={QLink}
                  to={`/u/${currUser.username}/assets`}
                  color="green"
                  size="huge"
                  style={{ marginTop: '1.5em', marginRight: '0.5em' }}
                  content="Keep going"
                />
                <Button
                  as={QLink}
                  to={`/learn`}
                  color="green"
                  size="huge"
                  style={{ marginTop: '0.5em' }}
                  content="Learn new skills"
                />
              </p>
            ) : (
              <p style={{ color: '#fff', fontSize: '3.5em', textAlign: 'center' }}>
                Combining Forces So That You Can Learn How to Code Games With Your Class
                <br />
                {/* <Button
                  centered
                  as={QLink}
                  to={`/signup`}
                  secondary
                  size="massive"
                  style={{ marginTop: '0.5em' }}
                  content="Sign me up"
                /> */}
              </p>
            )}
          </Grid.Row>
        </Grid>
        <Divider section />
        <Grid>
          <Grid.Row>
            <Grid.Column width={2} />
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('game-design-and-production')}
                hoverSrc={UX.makeMascotImgLink('game-design-and-production2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('learn-from-industry-leaders')}
                hoverSrc={UX.makeMascotImgLink('learn-from-industry-leaders2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('aie-child')}
                hoverSrc={UX.makeMascotImgLink('aie-child2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('work-on-latest-hardware-and-industry-software-tools')}
                hoverSrc={UX.makeMascotImgLink('work-on-latest-hardware-and-industry-software-tools2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('aie-game-programming')}
                hoverSrc={UX.makeMascotImgLink('aie-game-programming2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('develop-practical-skills-demanded-by-industry')}
                hoverSrc={UX.makeMascotImgLink('develop-practical-skills-demanded-by-industry2')}
              />
            </Grid.Column>
            <Grid.Column width={2} />
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}
