import React, { PropTypes } from 'react'
import { Button, Icon, Segment, Grid, List, Dropdown } from 'semantic-ui-react'
import { defaultAssetViewChoice } from '/client/imports/components/Assets/AssetCard'
import AssetList from '/client/imports/components/Assets/AssetList'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import ProjectsBeingMadeGET from '/client/imports/components/Projects/ProjectsBeingMadeGET'
import QLink from '/client/imports/routes/QLink'

import './dashboard.css'

// console.log(assetViewChoices, defaultAssetViewChoice)

export default class DashboardSocial extends React.Component {
  /* Just has fake data */
  render() {
    return (
      <Grid columns={16}>
        <Grid.Row stretched>
          <Grid.Column width={3}>
            {/* TODO need to reduce height for this div */}
            <div style={{ padding: '10px 10px', color: 'green' }}>
              <div style={{ width: '45%', float: 'left' }}>
                <Icon name="add square" /> Asset
              </div>
              <div style={{ width: '45%', float: 'left' }}>
                <Icon name="add square" />Project
              </div>
            </div>
            <Segment>
              <List>
                <List.Item>
                  <Icon name="share" /> Interactions with me
                </List.Item>
                <List.Item>
                  <Icon name="add user" /> Friends Activities
                </List.Item>
                <List.Item>
                  <Icon name="history" /> My Activities
                </List.Item>
                <List.Item>
                  <Icon name="announcement" /> MGB Announcements
                </List.Item>
                <List.Item>
                  <Icon name="star" /> MGB Featured
                </List.Item>
              </List>
            </Segment>
            <Segment>
              <List>
                <List.Item>
                  <Icon name="comments" /> Comments
                </List.Item>
                <List.Item>
                  <Icon name="heart" /> Hearts
                </List.Item>
                <List.Item>
                  <Icon name="spy" /> Follows
                </List.Item>
                <List.Item>
                  <Icon name="fork" /> Forks
                </List.Item>
                <List.Item>
                  <Icon name="image" /> Assets
                </List.Item>
                <List.Item>
                  <Icon name="sitemap" /> Projects
                </List.Item>
                <List.Item>
                  <Icon name="trophy" /> Badges
                </List.Item>
              </List>
            </Segment>
            <Segment>
              <List>
                <List.Item>
                  <Icon name="users" /> Followers
                </List.Item>
                <List.Item>
                  <Icon name="child" /> Following
                </List.Item>
              </List>
            </Segment>
            <p />
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment>
              <b>Timeline</b>
              <List>
                <List.Item className="timelineItem">
                  <div
                    className="img"
                    style={{
                      backgroundImage:
                        'url(/api/asset/cached-thumbnail/png/1497363600000/ix7ZQqYcZFs2Dpqfk?hash=1497363600000)',
                    }}
                  />Anny create asset penguine.jpg
                </List.Item>
                <List.Item className="timelineItem">
                  <QLink to={'/u/dgolds'} title="Bob">
                    Bob
                  </QLink>{' '}
                  followed{' '}
                  <QLink to={'/u/dgolds'} title="Jane">
                    Jane
                  </QLink>
                </List.Item>
                <List.Item className="timelineItem">
                  Robert commented on Dwyane code asset<br />
                  <i>You shouldn't use jQuery!</i>
                </List.Item>
                <List.Item className="timelineItem">Bob modified code.js</List.Item>
                <List.Item className="timelineItem">Bob delete asset bg.png</List.Item>
                <List.Item className="timelineItem">Jane created new graphic asset char</List.Item>
                <List.Item className="timelineItem">Bob modified code.js</List.Item>
                <List.Item className="timelineItem">Bob delete asset bg.png</List.Item>
                <List.Item className="timelineItem">Jane created new graphic asset char</List.Item>
                <List.Item className="timelineItem">Bob modified code.js</List.Item>
                <List.Item className="timelineItem">Bob delete asset bg.png</List.Item>
                <List.Item className="timelineItem">Jane created new graphic asset char</List.Item>
                <List.Item className="timelineItem">Bob modified code.js</List.Item>
              </List>
            </Segment>
          </Grid.Column>
          <Grid.Column width={5}>
            <Segment>
              <b>
                Games being made. <Icon name="circle" color="red" />LIVE!
              </b>
              <div style={{ clear: 'both' }} />
              <div
                className="ui image"
                style={{
                  background:
                    'url(/api/asset/cached-thumbnail/png/1497363600000/ix7ZQqYcZFs2Dpqfk?hash=1497363600000) center 10% / contain no-repeat',
                  backgroundSize: 'cover',
                  width: '100px',
                  height: '100px',
                  float: 'left',
                }}
              />
              <div
                className="ui image"
                style={{
                  background:
                    'url(/api/asset/thumbnail/png/ZT5KCyZLYsmeZpFST?hash=ZT5KCyZLYsmeZpFSTj3krcr5s) center 10% / contain no-repeat',
                  backgroundSize: 'cover',
                  width: '100px',
                  height: '100px',
                  float: 'left',
                }}
              />
              <div
                className="ui image"
                style={{
                  background:
                    'url(/api/asset/thumbnail/png/zw2jxoppcrsu3omSk?hash=zw2jxoppcrsu3omSkj3oc70bi) center 10% / contain no-repeat',
                  backgroundSize: 'cover',
                  width: '100px',
                  height: '100px',
                  float: 'left',
                }}
              />
              <div style={{ clear: 'both' }} />
              <p />

              <b>Members need help</b>
              <List>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/kvBq9PB987zuKiENQ?hash=1489976341396) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  />@christy - phaser tutorials ❮christy:assetName❯
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/soeQJYoWX9KH6WQTf?hash=1486212840678) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  />@bob - code basic games ❮bob:assetName❯
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/mo2GegyNMe77AyFtz?hash=1488748606351) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  />@John - graphic asset ❮John:assetName❯
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/pwNFDTXbQFnn2uKs3?hash=1491852094623) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  />@christy - phaser tutorials ❮christy:assetName❯
                </List.Item>
              </List>

              <b>Hot Games</b>
              <div style={{ float: 'right' }}>
                <Dropdown text="Month">
                  <Dropdown.Menu>
                    <Dropdown.Item text="Month" />
                    <Dropdown.Item text="Day" />
                    <Dropdown.Item text="Week" />
                    <Dropdown.Item text="Year" />
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <List>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/kvBq9PB987zuKiENQ?hash=1489976341396) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    Penguine
                  </div>
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/soeQJYoWX9KH6WQTf?hash=1486212840678) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    Digger
                  </div>
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/mo2GegyNMe77AyFtz?hash=1488748606351) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    Rocky
                  </div>
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/pwNFDTXbQFnn2uKs3?hash=1491852094623) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    Runner
                  </div>
                </List.Item>
              </List>

              <b>Featured Games</b>
              <div style={{ clear: 'both' }} />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/cached-thumbnail/png/1497363600000/ix7ZQqYcZFs2Dpqfk?hash=1497363600000)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/ZT5KCyZLYsmeZpFST?hash=ZT5KCyZLYsmeZpFSTj3krcr5s)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/zw2jxoppcrsu3omSk?hash=zw2jxoppcrsu3omSkj3oc70bi)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/PctCYyyjkdobZjfHq?hash=PctCYyyjkdobZjfHqj1qjs077)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/NpaRoqnutM2s9m7Ri?hash=NpaRoqnutM2s9m7Rij3awn95v)',
                }}
              />

              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/xpugerrSv4Kyv56q6?hash=xpugerrSv4Kyv56q6j3lc70wd)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/jE3RHKBvzkxn8Dk4D?hash=jE3RHKBvzkxn8Dk4Divikw618)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/d2hvft7SNvvJNpWee?hash=d2hvft7SNvvJNpWeej0cht1q5)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/GQ8J7QpeTTx9q9suo?hash=GQ8J7QpeTTx9q9suoj1f2sj35)',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  float: 'left',
                  backgroundSize: 'cover',
                  backgroundImage:
                    'url(/api/asset/thumbnail/png/D2erMwStJT3ickzB4?hash=D2erMwStJT3ickzB4j35bcdlp)',
                }}
              />
              <div style={{ clear: 'both' }} />
              <p />

              <b>Most Active Members</b>
              <div style={{ float: 'right' }}>
                <Dropdown text="Month">
                  <Dropdown.Menu>
                    <Dropdown.Item text="Month" />
                    <Dropdown.Item text="Day" />
                    <Dropdown.Item text="Week" />
                    <Dropdown.Item text="Year" />
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <List>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/kvBq9PB987zuKiENQ?hash=1489976341396) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    dgolds
                  </div>
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/soeQJYoWX9KH6WQTf?hash=1486212840678) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    shmikucis
                  </div>
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/mo2GegyNMe77AyFtz?hash=1488748606351) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    stauzs
                  </div>
                </List.Item>
                <List.Item>
                  <div
                    className="ui avatar centered image"
                    style={{
                      background:
                        'url(/api/asset/png/pwNFDTXbQFnn2uKs3?hash=1491852094623) center 10% / contain no-repeat',
                      paddingLeft: '35px',
                      lineHeight: '28px',
                    }}
                  >
                    bouhm
                  </div>
                </List.Item>
              </List>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

class DashboardUI extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    assets: PropTypes.array,
    loading: PropTypes.bool.isRequired,
  }

  static contextTypes = {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  }

  // TODO
  // trending stuff on the right
  // competition
  // if color is on palette, then don't do anything
  // top/hot/recommended games, watch people making games live, dailies, competitions
  // people who need help

  render() {
    return <DashboardSocial />
  }
}
