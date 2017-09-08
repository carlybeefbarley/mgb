import _ from 'lodash'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Divider, Header, Icon, Input, Segment, List, Modal, Popup } from 'semantic-ui-react'

import { AssetKinds } from '/imports/schemas/assets'
import QLink, { openAssetById, utilPushTo } from '/client/imports/routes/QLink'

const NameInfoAzzets = new Meteor.Collection('NameInfoAzzets')

const getContextualProjectName = ({ location, currentlyEditingAssetInfo, params }) => {
  const { query } = location
  const { projectNames } = currentlyEditingAssetInfo

  // Else is it a query?
  return _.first(projectNames) || _.get(query, 'project') || params.projectName
}

class RelatedAssetsUI extends React.Component {
  static propTypes = {
    /** The :params from /imports/routes/index.js via App.js. See there for description of params */
    params: PropTypes.object.isRequired,

    /** If there is a :id user id  or :username on the path, this is the user record for it */
    user: PropTypes.object,

    /** Currently logged in user.. or null if not logged in. */
    currUser: PropTypes.object,

    /** React Router location */
    location: PropTypes.object,

    /** An object with some info about the currently edited Asset - as defined in App.js' this.state */
    currentlyEditingAssetInfo: PropTypes.object.isRequired,
  }

  state = { activeIndex: 0, isModalOpen: false, searchQuery: '' }

  componentDidMount() {
    window.addEventListener('keydown', this.handleDocumentKeyDown, true)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleDocumentKeyDown)
  }

  getFilteredAssets = (assets, searchQuery) => {
    const assetNameQuickNavRegex = new RegExp('^.*' + _.escapeRegExp(searchQuery), 'i')
    return _.filter(assets, a => assetNameQuickNavRegex.test(a.name))
  }

  handleDocumentKeyDown = e => {
    const { assets } = this.props
    const { activeIndex, searchQuery, isModalOpen, isPopupOpen } = this.state

    const prevent = () => {
      e.preventDefault()
      e.stopPropagation()
    }

    // TODO: get constants for keycodes probably they should be here: app/client/imports/components/Skills/Keybindings.js
    // Ctrl (Cmd) + o (O)
    if (e.which === 79 && (e.ctrlKey || e.metaKey)) {
      this.toggleModal()
      prevent()
      return
    }

    if (isModalOpen || isPopupOpen) {
      const filteredAssets = this.getFilteredAssets(assets, searchQuery)
      let nextIndexMaybe = activeIndex

      // enter
      if (e.which === 13 || e.key === 'Enter') {
        this.handleAssetSelect()
        return
      } else if (e.which === 40) {
        // down
        nextIndexMaybe++
        prevent()
      } else if (e.which === 38) {
        // up
        nextIndexMaybe--
        // wrap from top to bottom
        if (nextIndexMaybe < 0) nextIndexMaybe = filteredAssets.length - 1
        // we still need to eat event
        prevent()
      } else if ((e.which === 78 || e.which === 192) && (e.ctrlKey || e.metaKey) && e.altKey) {
        // we add which === 192 here as osx meta modifies the which value
        // N + ctrl + alt
        utilPushTo(null, '/assets/create', { projectName: getContextualProjectName(this.props) })
        prevent()
      }

      // Modal will call onClose automatically - so no esc key handling here
      this.checkAndSetActiveIndex(nextIndexMaybe, filteredAssets)
    }
  }

  handleAssetSelect = () => {
    const { assets, params = {} } = this.props
    const { activeIndex, searchQuery } = this.state

    const filteredAssets = this.getFilteredAssets(assets, searchQuery)
    const id = _.get(filteredAssets[activeIndex], '_id')

    if (!id) return

    this.setState({ searchQuery: '', activeIndex: 0 }, () => {
      if (id && id !== params.assetId) openAssetById(id)
      this.closeAll()
    })
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ searchQuery: value }, () => {
      const { activeIndex, searchQuery } = this.state
      const { assets } = this.props

      const filteredAssets = this.getFilteredAssets(assets, searchQuery)

      // make sure we always have proper selection
      this.checkAndSetActiveIndex(activeIndex, filteredAssets)
    })
  }

  openModal = () => {
    this.setState({ activeIndex: 0, isModalOpen: true, isPopupOpen: false }, this.focusSearchInput)
  }

  openPopup = () => {
    this.setState({ activeIndex: 0, isModalOpen: false, isPopupOpen: true }, this.focusSearchInput)
  }

  closeAll = () => {
    this.closeModal()
    this.closePopup()
  }

  closeModal = () => this.setState({ isModalOpen: false })

  closePopup = () => this.setState({ isPopupOpen: false })

  toggleModal = () => {
    const { isModalOpen } = this.state

    if (isModalOpen) {
      this.setState(() => ({ isModalOpen: false }))
    } else {
      this.openModal()
    }
  }

  focusSearchInput = () => {
    // wait for it to open, then focus it
    setTimeout(() => {
      const relatedInput = document.querySelector('#mgb-related-assets-input')
      relatedInput && relatedInput.focus()
    })
  }

  /**
   * Checks if nextIndexMaybe is valid against filtered asset list - if it's not resets activeIndex to 0
   * This is triggered by arrow key to wrap up and search action to make sure we are in the allowed range
   * @param nextIndexMaybe - nextIndexCandidate
   * @param filteredAssets - filtered asset list
   */
  checkAndSetActiveIndex = (nextIndexMaybe, filteredAssets) => {
    const { activeIndex } = this.state
    if (nextIndexMaybe >= filteredAssets.length) nextIndexMaybe = 0

    if (nextIndexMaybe !== activeIndex) {
      this.setState({ activeIndex: nextIndexMaybe }, this.scrollActiveItemIntoView)
    } else {
      this.scrollActiveItemIntoView()
    }
  }

  scrollActiveItemIntoView = () => {
    const list = document.querySelector('#mgb-related-assets-list')
    const item = document.querySelector('#mgb-related-assets-list .active.item')

    if (!list || !item) return

    const isOutOfUpperView = item.offsetTop < list.scrollTop
    const isOutOfLowerView = item.offsetTop + item.clientHeight > list.scrollTop + list.clientHeight

    if (isOutOfUpperView) {
      list.scrollTop = item.offsetTop
    } else if (isOutOfLowerView) {
      list.scrollTop = item.offsetTop + item.clientHeight - list.clientHeight
    }
  }

  renderRelatedAssetsList = () => {
    const { currUser, assets, loading, user } = this.props
    const { activeIndex, searchQuery } = this.state

    const contextualProjectName = getContextualProjectName(this.props)
    const filteredRelatedAssets = this.getFilteredAssets(assets, searchQuery)
    const hasAssets = !_.isEmpty(assets)
    const username = _.get(user || currUser, 'username')

    const userLink = username && (
      <QLink to={`/u/${username}`} style={{ whiteSpace: 'nowrap' }}>
        <Icon name="user" />
        {username}
      </QLink>
    )

    const projectLink = contextualProjectName && (
      <QLink to={`/u/${username}/projects/${contextualProjectName}`} style={{ whiteSpace: 'nowrap' }}>
        <Icon name="sitemap" />
        {contextualProjectName}
      </QLink>
    )

    return (
      <div style={{ minWidth: '20em' }}>
        <Header size="small">
          Related Assets
          <Header.Subheader style={{ display: 'inline-block', marginLeft: '1em' }}>
            [Ctrl + O]
          </Header.Subheader>
        </Header>
        {hasAssets && (
          <Input
            id="mgb-related-assets-input" // so it can be focused on open
            fluid
            size="mini"
            icon="search"
            loading={loading}
            placeholder="Search"
            defaultValue={searchQuery}
            onChange={this.handleSearchChange}
          />
        )}
        {hasAssets && (
          <List
            id="mgb-related-assets-list"
            selection
            // Heads Up!
            // Position relative is required for scrolling out of view active items into view
            style={{ position: 'relative', maxHeight: '30em', minWidth: '18em', overflowY: 'auto' }}
            items={_.map(filteredRelatedAssets, (a, index) => ({
              key: a._id,
              as: QLink,
              onClick: this.closeAll,
              to: `/u/${a.dn_ownerName}/asset/${a._id}`,
              active: activeIndex === index,
              style: { color: AssetKinds.getColor(a.kind) },
              icon: { name: AssetKinds.getIconName(a.kind), color: AssetKinds.getColor(a.kind) },
              content:
                currUser && currUser.username === a.dn_ownerName ? a.name : `${a.dn_ownerName}:${a.name}`,
            }))}
          />
        )}
        {!hasAssets && (
          <Segment secondary textAlign="center">
            <Header icon color="grey">
              <Icon name="search" size="large" />
              <Header.Content>No results</Header.Content>
            </Header>
            <p>
              There are no assets related to
              {userLink && ' '}
              {userLink}
              {userLink && projectLink && ' or'}
              {projectLink && ' '}
              {projectLink}.
            </p>
          </Segment>
        )}
        <Divider />
        <Button
          as={QLink}
          to="/assets/create"
          query={{ projectName: contextualProjectName }}
          compact
          floated="right"
          size="tiny"
          color="green"
          content="Create [Ctrl + Alt + N]"
        />
        <Divider hidden fitted clearing />
      </div>
    )
  }

  renderModal = () => {
    const { isModalOpen } = this.state

    return (
      <Modal
        dimmer={false}
        size="mini"
        closeOnDocumentClick
        open={isModalOpen}
        onOpen={this.openModal}
        onClose={this.closeModal}
      >
        <Modal.Content>{this.renderRelatedAssetsList()}</Modal.Content>
      </Modal>
    )
  }

  renderPopup = () => {
    const { assets } = this.props
    const { isPopupOpen } = this.state

    return (
      <Popup
        on="hover"
        hoverable
        wide={_.isEmpty(assets) ? false : 'very'}
        // leave undefined for auto controlled open state on hover
        open={isPopupOpen === false ? false : undefined}
        onOpen={this.openPopup}
        onClose={this.closePopup}
        position="bottom left"
        trigger={
          <Button
            style={{ marginRight: '1rem' }}
            primary
            size="small"
            content="Related Assets"
            icon="dropdown"
          />
        }
      >
        <Popup.Content>{this.renderRelatedAssetsList()}</Popup.Content>
      </Popup>
    )
  }

  render() {
    return (
      <div>
        {this.renderPopup()}
        {this.renderModal()}
      </div>
    )
  }
}

const RelatedAssets = createContainer(props => {
  const { user, currUser, currentlyEditingAssetInfo, location, params } = props
  const handleForAssets = Meteor.subscribe(
    'assets.public.nameInfo.query',
    _.get(user || currUser, '_id', null),
    null, // assetKinds=all
    '', // Search for string in name
    getContextualProjectName({ location, currentlyEditingAssetInfo, params }),
    false,
    false,
    'edited', // Sort by recently edited
    user || currUser ? 50 : 10, // Just a few if not logged in and no context
  )

  return {
    ...props,
    loading: !handleForAssets.ready(),
    assets: NameInfoAzzets.find().fetch(),
  }
}, RelatedAssetsUI)

export default RelatedAssets
