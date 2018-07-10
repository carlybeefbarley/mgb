import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Modal } from 'semantic-ui-react'

import AssetCreateNew from './AssetCreateNew'

class AssetCreateNewModal extends Component {
  static propTypes = {
    modalProps: PropTypes.object,
    buttonProps: PropTypes.object,
    viewProps: PropTypes.object,
    currUser: PropTypes.object,
    currUserProjects: PropTypes.array,
  }

  render() {
    const { buttonProps, currUser, currUserProjects, modalProps, viewProps } = this.props

    const canCreate = !_.isEmpty(currUser)

    return (
      <Modal
        size="small"
        closeIcon
        trigger={
          <Button color="green" icon="pencil" content="Create Asset" disabled={!canCreate} {...buttonProps} />
        }
        {...modalProps}
      >
        <Modal.Content>
          <AssetCreateNew currUser={currUser} currUserProjects={currUserProjects} {...viewProps} />
        </Modal.Content>
      </Modal>
    )
  }
}

export default AssetCreateNewModal
