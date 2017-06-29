import React from 'react'


export default class FullScreenExitPosition extends React.Component {

  options = {
    'top left': 'top left',
    'top center': 'top center',
    'top right': 'top right',

    'middle left':'middle left',
    // 'middle center':'middle center',
    'middle right': 'middle right',

    'bottom left':'bottom left',
    'bottom center':'bottom center',
    'bottom right': 'bottom right'

  }

  render(){
    const val = this.props.value || 'top right'

    return (
      <div className="fs-exit-pos-container" onClick={e => this.props.onChange(e.target.dataset.value)}>
        {
          _.map(this.options, (v, k) => {
            return <div className={v + (val === v ? ' primary' : '') + ' ui button'} data-value={v}></div>
          })
        }
      </div>
    )
  }
}
