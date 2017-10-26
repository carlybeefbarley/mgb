import _ from 'lodash'
import React, { Component } from 'react'
import { Container, Divider, Header } from 'semantic-ui-react'

import { createContainer } from 'meteor/react-meteor-data'

import { Activity } from '/imports/schemas'
import { showToast } from '/client/imports/routes/App'
import { utilPushTo } from '/client/imports/routes/QLink'

class HourOfCodeRoute extends Component {
  componentDidMount() {
    this.waitForLogin()
      .then(() => this.waitForLoading())
      .then(() => {
        const { activity, location } = this.props
        const recentAsset = _.first(activity)
        console.log('Login and loading done, activity is:', activity)

        if (recentAsset) {
          return utilPushTo(location.query, `/u/${recentAsset.toOwnerName}/asset/${recentAsset.toAssetId}`)
        }

        this.createHoCUser()
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

    const { location } = this.props

    // remove the query flag so we don't try to create more users when App updates
    const newQuery = { ...location.query, createGuest: undefined }
    utilPushTo(newQuery, location.pathname)

    const assetName = 'dwarfs.userCode0'
    const assetKind = 'code'
    const projectName = 'hourOfCode'
    const projectDescription = 'Auto-created for Hour of Code'

    Meteor.call('User.generateGuestUser', (err, guestUser) => {
      if (err) return console.error('Failed to generate a guest user object:', err)

      console.log('Generated guest user:', guestUser)

      Accounts.createUser(guestUser, error => {
        if (error) return showToast('Could not create user:' + error.reason, 'error')

        console.log('Created guest user:', guestUser)

        const newProject = {
          name: projectName,
          description: projectDescription,
        }

        Meteor.call('Projects.create', newProject, (error, result) => {
          if (error) return showToast('Could not create project:' + error.reason, 'error')

          console.log('Created project:', result)

          const newAsset = {
            name: assetName,
            kind: assetKind,
            text: '',
            thumbnail: '',
            content2: {},
            dn_ownerName: guestUser.username,
            ownerId: guestUser._id,
            projectNames: [projectName],
            isCompleted: false,
            isDeleted: false,
            isPrivate: false,
          }

          Meteor.call('Azzets.create', newAsset, (error, result) => {
            if (error) return showToast('Could not create asset: ' + error.reason, 'error')

            console.log('Created asset:', result)

            // Now go to the new Asset
            utilPushTo(null, `/u/${newAsset.dn_ownerName}/asset/${result}`)
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
