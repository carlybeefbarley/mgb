import _ from 'lodash'
import React, { Component } from 'react'
import { Container, Divider, Icon, Image, Segment } from 'semantic-ui-react'
import UX from '../../UX'

import { createContainer } from 'meteor/react-meteor-data'

import { Azzets } from '/imports/schemas'
import { AssetKindEnum, assetMakeSelector, assetSorters } from '/imports/schemas/assets'

import HeroLayout from '/client/imports/layouts/HeroLayout'
import { showToast } from '/client/imports/modules'
import { utilPushTo } from '/client/imports/routes/QLink'
import { hourOfCodeStore } from '/client/imports/stores'
import Hotjar from '/client/imports/helpers/hotjar'
import Recaptcha from '/client/imports/components/Recaptcha/Recaptcha'

let isCreatingGuest = false

class HourOfCodeRoute extends Component {
  state = { isLoading: true }

  componentDidMount() {
    Hotjar('trigger', 'hour-of-code')

    this.waitForLogin()
      .then(() => this.waitForLoading())
      .then(() => {
        const { assets, currUser, location } = this.props
        const asset = _.first(assets)
        const isGuest = _.get(currUser, 'profile.isGuest')
        console.log('Login and loading done')
        console.log('  isGuest:', isGuest)
        console.log('  asset:', asset)
        console.log('  assets:', assets)

        if (asset && isGuest) {
          isCreatingGuest = false
          window.clearInterval(this.waitForLoadingTimer)
          window.clearInterval(this.waitForLoginTimer)
          return utilPushTo(location.query, `/u/${asset.dn_ownerName}/asset/${asset._id}`)
        }
      })
      .catch(err => {
        throw err
      })
  }

  /**
   * Creates a guest user, a project, and a code asset.
   */
  createHocUser = () => {
    if (isCreatingGuest) return console.log('Refusing to create duplicate guest, already in progress...')
    this.setState(() => ({ isLoading: true }))
    isCreatingGuest = true

    Hotjar('vpv', 'hour-of-code/create-guest-start')
    console.log('Creating hour of code user...')

    Meteor.call('User.generateGuestUser', (err, guestUser) => {
      if (err) {
        isCreatingGuest = false
        return console.error('Failed to generate a guest user object:', err)
      }

      console.log('Generated guest user:', guestUser)
      guestUser.profile.HoC = { currStepId: '', stepToAssetMap: {} } // Stores HoC activity progress

      Accounts.createUser(guestUser, (error, id) => {
        if (error) {
          isCreatingGuest = false
          return showToast.error('Could not create user:' + error.reason)
        }

        console.log('Created guest user:', guestUser)

        hourOfCodeStore.getActivityData(true).then(activityAsset => {
          if (!_.isArray(_.get(activityAsset, 'steps'))) {
            isCreatingGuest = false
            console.error('Activity asset does not have valid steps:', activityAsset)
            return showToast.error('Cannot load activity: ' + err.reason)
          }

          const azzetCreate = newAsset => {
            return new Promise((resolve, reject) => {
              Meteor.call('Azzets.create', newAsset, (error, assetId) => {
                if (error) {
                  isCreatingGuest = false
                  return reject(error)
                }
                resolve({ ...newAsset, _id: assetId })
              })
            })
          }

          // map asset to steps then add it to user.profile.HoC
          // nav to first asset once done
          const mapStepToAsset = userAssets => {
            let stepToAssetMap = {}
            _.forEach(userAssets, (asset, i) => {
              stepToAssetMap[activityAsset.steps[i].id] = asset._id
            })

            Meteor.call(
              'User.updateProfile',
              Meteor.user()._id,
              {
                'profile.HoC.stepToAssetMap': stepToAssetMap,
              },
              error => {
                isCreatingGuest = false
                if (error) return console.error('Could not update stepToAssetMap to profile:', error.reason)

                // Nav to first asset
                const assetId = userAssets[0]._id
                Hotjar('vpv', 'hour-of-code/create-guest-success', this.props.currUser)
                utilPushTo(null, `/u/${guestUser.username}/asset/${assetId}`)
              },
            )
          }

          const userAssetPromises = activityAsset.steps
            .map(hourOfCodeStore.getUserAssetShape)
            .map(azzetCreate)

          Promise.all(userAssetPromises)
            .then(mapStepToAsset)
            .catch(error => {
              isCreatingGuest = false
              console.error('Cannot create asset:', error)
              showToast.error('Cannot create asset: ' + error.reason)
            })
        })
      })
    })
  }

  waitForLogin = (timeout = 1000 * 30) => {
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

        this.waitForLoginTimer = setTimeout(checkLoggingIn, 250)
      }

      checkLoggingIn()
    })
  }

  waitForLoading = (timeout = 1000 * 30) => {
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

        this.waitForLoadingTimer = setTimeout(checkLoading, 250)
      }

      checkLoading()
    })
  }

  handleRecaptchaLoad = () => this.setState({ isLoading: false })

  render() {
    const { isLoading } = this.state

    return (
      <HeroLayout
        heroContent={
          <Container text textAlign="center">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: '2' }}>
                <Image centered src="/images/logos/hoc/HourOfCode_logo_RGB.png" style={{ width: 200 }} />
              </div>
              <div style={{ flex: '1' }}>
                <Icon name="plus" inverted size="huge" />
              </div>
              <div style={{ flex: '2' }}>
                <Segment inverted style={{ margin: 'auto', width: 220, height: 200 }}>
                  <Image centered src={UX.makeMascotImgLink('team')} style={{ width: 200 }} />
                  <Image centered src="/images/logos/mgb/medium/01w.png" style={{ width: 200 }} />
                </Segment>
              </div>
            </div>

            <Divider hidden />

            <Segment size="huge">
              <p>Welcome to an Hour of Code™ with My Game Builder!</p>
              {isLoading && (
                <p>
                  <Icon loading name="spinner" />
                </p>
              )}
              <Recaptcha onLoad={this.handleRecaptchaLoad} onComplete={this.createHocUser} />
            </Segment>

            <Divider hidden section />
          </Container>
        }
      />
    )
  }
}

export default createContainer(props => {
  const userId = _.get(props, 'currUser._id')

  const handleForAssets = Meteor.subscribe(
    'assets.public',
    userId,
    [AssetKindEnum.code],
    null, // search
    null, // project
    true, // only deleted
    false, // only stable
    assetSorters.edited, // sort
  )
  const assetSelector = assetMakeSelector(
    userId,
    [AssetKindEnum.code],
    null, // nameSearch
    null, // projectName (null, any/all projects)
    true, // showDeleted
  )

  return {
    assets: userId ? Azzets.find(assetSelector, { sort: assetSorters.edited }).fetch() : [],

    loading: !handleForAssets.ready(),
  }
}, HourOfCodeRoute)
