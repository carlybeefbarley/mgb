import React from 'react'
import QLink from '/client/imports/routes/QLink'

import { Grid, List } from 'semantic-ui-react'

const style = {
  // do not flex
  flex: '0 0 auto',
}

const Footer = () => (
  <Grid columns="equal" stackable padded style={style}>
    <Grid.Column color="black">
      <List
        size="small"
        inverted
        horizontal
        relaxed
        divided
        link
        items={[
          `Copyright ©${new Date().getFullYear()} MyCodeBuilder Inc. All Rights Reserved.`,
          { key: 'terms', as: QLink, to: '/legal/tos', content: 'Terms of Service' },
          { key: 'privacy', as: QLink, to: '/legal/privacy', content: 'Privacy Policy' },
          { key: 'contact', as: 'a', href: 'mailto:hello@mygamebuilder.com', children: 'Contact Us' },
        ]}
      />
    </Grid.Column>
  </Grid>
)

export default Footer
