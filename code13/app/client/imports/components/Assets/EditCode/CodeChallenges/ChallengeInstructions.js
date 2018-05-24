import PropTypes from 'prop-types'
import React from 'react'
import { Segment, Header, Divider } from 'semantic-ui-react'

export default class ChallengeInstructions extends React.Component {
  static propTypes = {
    instructions: PropTypes.array,
    description: PropTypes.array,
    fullBannerText: PropTypes.string,
  }

  render() {
    return (
      <div>
        <Divider horizontal>Challenge Instructions</Divider>

        {this.props.fullBannerText && <Header sub content={this.props.fullBannerText} />}

        {this.props.description.map((text, i) => <p key={i} dangerouslySetInnerHTML={{ __html: text }} />)}

        {this.props.instructions.length > 0 && (
          <Segment stacked color="green">
            <Header sub content="Challenge Goal" />
            {this.props.instructions.map((text, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
            ))}
          </Segment>
        )}
      </div>
    )
  }
}
