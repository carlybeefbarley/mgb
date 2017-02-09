import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'


export default class StringExtendedInfo extends React.Component {
  static propTypes = {
    scripts: React.PropTypes.array, // list of scripts
    knownImports: React.PropTypes.array, // list of known imports - won't show in the list
    includeImport: React.PropTypes.func, // callback to import script
    assetName: React.PropTypes.string
  }
  constructor(...a){
    super(...a)
    this.state = {
      showExpanded: true
    }
    this.options = []
  }
  handleHideShowClick(){
    this.setState({"showExpanded": !this.state.showExpanded})
  }

  componentWillReceiveProps(props){
    const map = []
    props.scripts.forEach( s => {
      const index = props.knownImports.findIndex( a => {
        //console.log("origin", a.origin )
        return a.origin == props.assetName && s.text == a.name.substring(1)
      })
      if(index > -1){
        return null
      }
      map.push({ text: s.text, description: s.desc, value: s.text})
    })
    this.options = _.uniqWith(map, _.isEqual)
  }

  render() {
    if(!this.props.scripts || !this.props.scripts.length)
      return null


    const {showExpanded} = this.state

    return <div className="ui blue segment" style={{backgroundColor: "rgba(160,32,240,0.03)", color: "#2A00FF"}}>
      <a className="ui left ribbon label">
        <small>My Scripts</small>
      </a>
      <a className="ui blue right corner label" title="Click to hide import helper">
        <i className="minus circle icon"></i>
      </a>
      <div style={{marginTop: '5px'}}>
        <Dropdown
          fluid search selection
          options={ this.options }
          placeholder='Select script from a list to import it'
          value=''
          selectOnBlur={false}
          onChange={ (a, b) => {
            this.props.includeImport(b.value)
          }}
          />
        </div>
    </div>
  }
}
