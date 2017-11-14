import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { List, Divider } from 'semantic-ui-react'

export default class ChallengeResults extends React.Component {
  static propTypes = {
    results: PropTypes.array,
    latestTestTimeStr: PropTypes.string,
  }

  render() {
    return (
      <div>
        {!_.isEmpty(this.props.results) && (
          <Divider horizontal>
            <span>
              Test Results&ensp;
              {this.props.latestTestTimeStr && (
                <small style={{ color: '#bbb' }}>@{this.props.latestTestTimeStr}</small>
              )}
            </span>
          </Divider>
        )}
        <List verticalAlign="middle">
          {this.props.results.map((result, i) => (
            <List.Item key={result.message} className="animated fadeIn">
              <List.Icon
                size="large"
                name={`circle ${result.success ? 'check' : 'minus'}`}
                color={result.success ? 'green' : 'red'}
              />
              <List.Content>
                <span dangerouslySetInnerHTML={{ __html: _.replace(result.message, /^message: /, '') }} />
              </List.Content>
            </List.Item>
          ))}
        </List>
      </div>
    )
  }
}
