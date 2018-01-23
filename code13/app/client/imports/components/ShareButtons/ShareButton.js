import React, { PropTypes } from 'react'
import { Button, Popup, TextArea, Segment, Input, Form, Divider } from 'semantic-ui-react'
import _ from 'lodash'

export default class ShareButton extends React.Component {
  // Available services
  static options = [
    'facebook',
    'twitter',
    'google',
    'blogger',
    'reddit',
    'tumblr',
    'pinterest',
    'vk',
    'linkedin',
    'stumbleupon',
    'mail',
  ]

  static propTypes = {
    url: PropTypes.string.isRequired, // URL which will be shared
    description: PropTypes.string, // Optional description - works only for some services like FB
    tooltip: PropTypes.oneOfType([PropTypes.component, PropTypes.string]), // tooltip content - is visible on hover before real share content
    position: PropTypes.string, // SUIR Popup position - see SUIR Popup docs
  }

  static services = {
    // TODO: verify if this is link - fb automatically closes popup if link isn't in the correct format
    // TODO: get correct FB app_id
    facebook: {
      title: 'Facebook',
      link: content => `https://www.facebook.com/dialog/share?app_id=87741124305&href=${content.url}`,
    },
    twitter: {
      title: 'Twitter',
      link: c => `https://twitter.com/intent/tweet?url=${c.url}`,
    },

    mail: {
      title: 'Email',
      link: c => `mailto:?body=${c.url} /n${c.description}`,
    },

    google: {
      title: 'Goole+',
      icon: 'google plus',
      link: c => `https://plus.google.com/share?url=${c.url}`,
    },

    // blogger seems to be broken also on youtube
    blogger: {
      title: 'Blogger',
      link: c => `http://www.blogger.com/blog-this.g?n=${c.url}`,
    },

    reddit: {
      title: 'Reddit',
      link: c => `https://www.reddit.com/submit?url=${c.url}&title=${c.description}`,
    },

    // canoncial URL is for counter - maybe extract base from c.url ?
    tumblr: {
      title: 'Tumblr',
      link: c =>
        `https://www.tumblr.com/widgets/share/tool/preview?shareSource=legacy&url=${c.url}&caption=${c.description}&canonicalUrl=https://build.games&_format=html`,
    },

    // TODO: pinterest requires media - probably create HOC for specific MGB api features
    pinterest: {
      title: 'Pinterest',
      link: c =>
        `https://www.pinterest.com/pin/create/button/?url=${c.url}&description=${c.description}&media=//d1d15nbexzn633.cloudfront.net/images/mascots/team.png?hash=static`,
    },

    vk: {
      title: 'ВКонтакте',
      link: c => `http://vkontakte.ru/share.php?url=${c.url}`,
    },
    // TODO: linked in has summary and source as additional info
    linkedin: {
      title: 'LinkedIn',
      link: c =>
        `https://www.linkedin.com/shareArticle?url=${c.url}&title=${c.description}&summary=By+build.games&source=MyGameBuilder`,
    },

    stumbleupon: {
      title: 'StumbleUpon',
      link: c => `https://www.stumbleupon.com/badge?url=${c.url}&title=${c.description}`,
    },
  }

  constructor(...p) {
    super(...p)
    this.state = {
      url: _.escape(this.props.url),
      description: _.escape(this.props.description),
      hovered: false,
      open: 0,
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      url: _.escape(props.url),
      description: _.escape(props.description),
    })
  }

  getServiceLink = service => {
    return ShareButton.services[service]
      ? ShareButton.services[service].link(this.state)
      : 'javascript:alert(todo:"' + this.state.content + '")'
  }

  getServiceTitle = service => {
    return ShareButton.services[service] ? ShareButton.services[service].title : 'MISSING service: ' + service
  }

  makeButtons = () =>
    ShareButton.options
      .map(val => {
        if (
          ('all' in this.props && this.props.all !== false) ||
          (val in this.props && this.props[val] !== false)
        ) {
          const icon = ShareButton.services[val].icon || val

          return (
            <a
              key={val}
              href={this.getServiceLink(val)}
              target="_blank"
              rel="noopener noreferrer"
              title={this.getServiceTitle(val)}
            >
              <Button icon={icon} color={icon} />
            </a>
          )
        }
      })
      .filter(a => !!a)

  setNewUrl = (event, data) => {
    this.setState({ url: _.escape(data.value) })
  }

  setNewDescription = (event, data) => {
    this.setState({ description: _.escape(data.value) })
  }
  shareLinks = () => {
    return (
      <div>
        <p>{this.makeButtons()}</p>
        <Form>
          <Input value={this.props.url} onChange={this.setNewUrl} fluid ref={this.handleInputRef} />
          {'description' in this.props && (
            <Form.TextArea
              autoHeight
              defaultValue={this.props.description}
              onChange={this.setNewDescription}
            />
          )}
        </Form>
      </div>
    )
  }

  handleOpen = () => {
    if (this.props.tooltip)
      this.setState({
        isOpen: true,
        content: this.props.tooltip,
      })
  }
  handleClose = e => {
    this.setState({
      isOpen: false,
    })
  }
  handleInputRef = input => {
    input && input.inputRef.select()
  }
  handleShareClick = e => {
    this.setState({
      isOpen: true,
      content: this.shareLinks(),
    })
  }
  render() {
    return (
      <Popup
        hoverable
        position={this.props.position}
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        open={!!this.state.isOpen}
        style={{ width: '300px', maxWidth: 'none' }}
        trigger={
          this.props.children ? (
            React.cloneElement(this.props.children, { onClick: this.handleShareClick })
          ) : (
            <Button icon="share" onClick={this.handleShareClick} />
          )
        }
        content={this.state.content || this.props.tooltip}
        on={'hover'}
      />
    )
  }
}
