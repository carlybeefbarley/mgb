import React from 'react'
Array.isArray = Array.isArray || (obj => obj instanceof Array)
export default class SmallDD extends React.Component {
  state = { hasTriggered: false }
  render() {
    const items = []
    let options
    if (Array.isArray(this.props.options)) {
      options = this.props.options
    } else {
      options = []
      Object.keys(this.props.options).forEach(k => {
        options.push({ text: k, value: this.props.options[k] })
      })
    }
    if (this.state.hasTriggered) {
      for (let i = 0; i < options.length; i++) {
        items.push(
          <div
            className="item"
            onClick={e => {
              console.log(e.target.dataset.value)
              this.props.onChange && this.props.onChange(e.target.dataset.value)
            }}
            data-value={options[i].value == void 0 ? options[i].text : options[i].value}
            key={i}
          >
            {options[i].text}
          </div>,
        )
      }
    }
    const active = options.find(
      o => (o.value !== void 0 ? o.value == this.props.value : o.text == this.props.value),
    )

    return (
      <div
        className="ui fluid selection dropdown"
        onMouseOver={
          this.state.hasTriggered ? null : (
            e => {
              //console.log("initialized dropdown!!", $(e.target).closest(".selection.dropdown"))
              $(e.target).closest('.selection.dropdown').dropdown()
              this.setState({ hasTriggered: true })
            }
          )
        }
      >
        <input type="hidden" name="country" value="0" />
        <i className="dropdown icon" />
        {this.props.value != void 0 ? (
          <div id="dd-text" className="text">
            {active && active.text}
          </div>
        ) : (
          <div className="default text">Select...</div>
        )}
        <div className="menu" ref="menu">
          {this.state.hasTriggered && items}
        </div>
      </div>
    )
  }
}
