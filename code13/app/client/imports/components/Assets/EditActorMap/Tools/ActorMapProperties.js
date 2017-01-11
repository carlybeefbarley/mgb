'use strict'
import React from 'react'
import Otito from '/client/imports/helpers/Otito'

export default class Properties extends React.Component {
  constructor (...args) {
    super(...args)
    this.ready = 0
    this.settings = null
  }

  componentDidMount () {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
    this.runOnReady()
  }

  componentWillReceiveProps(newp){
    this.settings.map.update(newp.data)
  }

  runOnReady () {
    this.settings = {}
    this.settings.map = new Otito(this.props.data, {
      Map: {
        _type: Otito.type.folder,
        open: true,
        contentClassName: 'ui content one column stackable grid active',
        title: '',
        content: {
          width: {
            _type: Otito.type.number,
            head: 'width',
            needsConfirmation: true,
            onchange: (input) => {
              if (!input.value)
                input.value = 1
              this.props.resize(this.settings.map.object)
            },
            min: 1
          },
          height: {
            _type: Otito.type.number,
            head: 'height',
            needsConfirmation: true,
            onchange: (input) => {
              if (!input.value)
                input.value = 1
              this.props.resize(this.settings.map.object)
            },
            min: 1
          }
        }
      }
    }, () => {
      //this.props.resize(this.props.data)
    })
    this.settings.map.append(this.refs.map)
    window.settings = this.settings
  }

  render () {
    return (
      <div  id="mgbjr-MapTools-properties" className='mgbAccordionScroller'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> Properties</span>
          </div>
          <div className='active content menu' ref='holder'>
            <div ref='map'></div>
          </div>
        </div>
      </div>
    )
  }
}
