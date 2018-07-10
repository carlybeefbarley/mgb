import PropTypes from 'prop-types'
import React from 'react'
import { Grid, Header, Button, Segment } from 'semantic-ui-react'

import QLink from '/client/imports/routes/QLink'

const buttonExtraStyle = {
  marginTop: '0.5em',
  opacity: '0.5',
}

export default class DashboardAction extends React.Component {
  static propTypes = {
    buttonContent: PropTypes.string,
    color: PropTypes.string,
    buttonExtra: PropTypes.string,
    header: PropTypes.string,
    icon: PropTypes.string,
    onButtonClick: PropTypes.func,
    subheader: PropTypes.string,
    to: PropTypes.string,
  }

  render() {
    const { color, buttonContent, buttonExtra, header, icon, onButtonClick, subheader, to } = this.props

    return (
      <Segment color={color} raised padded>
        <Grid columns="equal" stackable>
          <Grid.Column>
            <Header as="h2" color={color} icon={icon} content={header} subheader={subheader} />
          </Grid.Column>
          <Grid.Column style={{ flex: '0 0 auto', width: '15em' }}>
            <Button as={QLink} to={to} color={color} content={buttonContent} onClick={onButtonClick} fluid />
            {buttonExtra && <div style={buttonExtraStyle}>{buttonExtra}</div>}
          </Grid.Column>
        </Grid>
      </Segment>
    )
  }
}
