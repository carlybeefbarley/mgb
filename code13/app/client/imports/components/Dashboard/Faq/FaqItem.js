import React, { PropTypes } from 'react'
import { List } from 'semantic-ui-react'

export default class FaqItem extends React.Component {
  static propTypes = {
    question: PropTypes.string,
    answer: PropTypes.string,
  }

  state = {
    isCollapsed: false,
  }

  toggleCollapse = () => this.setState({ isCollapsed: !this.state.isCollapsed })

  render() {
    return (
      <List.Item onClick={this.toggleCollapse}>
        {this.props.question}
        {this.state.isCollapsed && <List.Content>{this.props.answer}</List.Content>}
      </List.Item>
    )
  }
}
