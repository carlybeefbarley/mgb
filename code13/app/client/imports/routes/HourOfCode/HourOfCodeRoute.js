import _ from 'lodash'
import React, { Component } from 'react'
import { Container, Divider, Header } from 'semantic-ui-react'

import { createContainer } from 'meteor/react-meteor-data'

import { Activity } from '/imports/schemas'
import { showToast } from '/client/imports/routes/App'
import { utilPushTo } from '/client/imports/routes/QLink'
import { hourOfCodeStore } from '/client/imports/stores'

class HourOfCodeRoute extends Component {
  componentDidMount() {
    this.waitForLogin()
      .then(() => this.waitForLoading())
      .then(() => {
        const { activity, currUser, location } = this.props
        const recentAsset = _.first(activity)
        const isGuest = _.get(currUser, 'profile.isGuest')
        console.log('Login and loading done, activity is:', activity)

        if (recentAsset && isGuest) {
          return utilPushTo(location.query, `/u/${recentAsset.toOwnerName}/asset/${recentAsset.toAssetId}`)
        } else {
          this.createHoCUser()
        }
      })
      .catch(err => {
        throw err
      })
  }

  /**
   * Creates a guest user, a project, and a code asset.
   */
  createHoCUser = () => {
    console.log('Creating hour of code user...')

    Meteor.call('User.generateGuestUser', (err, guestUser) => {
      if (err) return console.error('Failed to generate a guest user object:', err)

      console.log('Generated guest user:', guestUser)
      guestUser.profile.HoC = { currStepIndex: 0 } // Stores HoC activity progress

      Accounts.createUser(guestUser, (error, id) => {
        if (error) return showToast('Could not create user:' + error.reason, 'error')

        console.log('Created guest user:', guestUser)

        const newProject = hourOfCodeStore.getUserProjectShape()

        Meteor.call('Projects.create', newProject, (error, projectId) => {
          if (error) return showToast('Could not create project:' + error.reason, 'error')

          console.log('Created project:', projectId)

          hourOfCodeStore.getActivityData().then(activityAsset => {
            if (!_.isArray(_.get(activityAsset, 'steps'))) {
              console.error('Activity asset does not have valid steps:', activityAsset)
              return showToast('Cannot load activity: ' + err.reason, 'error')
            }

            const azzetCreate = newAsset => {
              return new Promise((resolve, reject) => {
                Meteor.call('Azzets.create', newAsset, (error, assetId) => {
                  if (error) return reject(error)

                  resolve({ ...newAsset, _id: assetId })
                })
              })
            }

            const userAssetPromises = activityAsset.steps
              .map((step, i) => hourOfCodeStore.getUserAssetShape(step, i))
              .map(userAssetShape => azzetCreate(userAssetShape))

            Promise.all(userAssetPromises)
              .then(userAssets => {
                const assetId = userAssets[0]._id
                utilPushTo(null, `/u/${guestUser.username}/asset/${assetId}`)
              })
              .catch(error => {
                console.error('Cannot create asset:', error)
                showToast('Cannot create asset: ' + error.reason, 'error')
              })
          })
        })
      })
    })
  }

  waitForLogin = (timeout = 1000 * 10) => {
    return new Promise((resolve, reject) => {
      const start = Date.now()

      const checkLoggingIn = () => {
        if (Date.now() - start >= timeout) {
          return reject(new Error('Timed out waiting for login in to finish.'))
        }

        if (!Accounts.loggingIn()) {
          console.log('=> login finished')
          return resolve()
        }

        console.log('...waiting for login to finish')

        setTimeout(checkLoggingIn, 250)
      }

      checkLoggingIn()
    })
  }

  waitForLoading = (timeout = 1000 * 10) => {
    return new Promise((resolve, reject) => {
      const start = Date.now()

      const checkLoading = () => {
        if (Date.now() - start >= timeout) {
          return reject(new Error('Timed out waiting for loading to finish.'))
        }

        if (!this.props.loading) {
          console.log('=> loading finished')
          return resolve()
        }

        console.log('...waiting for loading to finish')

        setTimeout(checkLoading, 250)
      }

      checkLoading()
    })
  }

  render() {
    return (
      <Container text textAlign="center">
        <Divider hidden section />
        <Header as="h1">Welcome to an Hour of Code with My Game Builder!</Header>

        <p>Setting up...</p>
      </Container>
    )
  }
}

export default createContainer(props => {
  const userId = _.get(props, 'currUser._id')

  const handleActivity = Meteor.subscribe('activity.public.assets.recent.userId', userId, 4)

  return {
    activity: Activity.find(
      { byUserId: userId, toAssetId: { $ne: '' } },
      { sort: { timestamp: -1 }, limit: 1 },
    ).fetch(),

    loading: !handleActivity.ready(),
  }
}, HourOfCodeRoute)
