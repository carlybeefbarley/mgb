import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'
import settings from '/imports/SpecialGlobals.js'


export default class StringExtendedInfo extends React.Component {
  static propTypes = {
    scripts: React.PropTypes.array, // list of scripts
    knownImports: React.PropTypes.array, // list of known imports - won't show in the list
    includeImport: React.PropTypes.func, // callback to import script
    assetName: React.PropTypes.string
  }
  constructor(...a){
    super(...a)
    const savedState = parseInt(localStorage.getItem("EditCodeImportHelperPanelExtended"), 10)

    this.state = {
      showExpanded: savedState === null ? 0 : savedState
    }
    this.updateProps(this.props)
  }
  handleHideShowClick(){
    const next = this.state.showExpanded ? 0 : 1
    localStorage.setItem("EditCodeImportHelperPanelExtended", next)
    this.setState({"showExpanded": next})
  }
  shouldComponentUpdate(newP, newS){
    return !_.isEqual(this.state, newS) || !_.isEqual(this.props, newP)
  }
  componentWillReceiveProps(props){
    if(!_.isEqual(this.props, props)){
      this.updateProps(props)
    }
  }
  updateProps(props){
    const checkIfImported = (s, global = false) => {
      if(props.knownImports){
        const index = props.knownImports.findIndex( known => {
          if(global){
            return s.import === known.name
          }
          else{
            return s.text == known.name.substring(1)
          }
        })
        return index > -1
      }
      return false
    }

    const map = []
    if(props.scripts) {
      props.scripts.forEach(s => {
        if (checkIfImported(s)) {
          return
        }
        map.push({text: s.text, description: s.desc, value: s.text})
      })
      this.options = _.uniqWith(map, _.isEqual)
    }

    const libs = settings.editCode.popularLibs
    this.popuplar = []
    libs.forEach( (s, i) => {
      if(checkIfImported(s, true)){
        return
      }
      this.popuplar.push({ text: s.name, description: s.desc, value: i})
    })
  }

  render() {
    if(!this.props.scripts || !this.props.scripts.length)
      return null

    const {showExpanded} = this.state
    return <div className="ui blue segment" style={{backgroundColor: "rgba(160,32,240,0.03)", color: "#2A00FF"}}>

      <a className="ui blue right corner label" title={`Click to ${ showExpanded ? "hide" : "show" } import helper`}
         onClick={() => this.handleHideShowClick()}
        >
        <i className={(!showExpanded ? "add circle " : "minus circle ")+ " icon"}></i>
      </a>

      {!!showExpanded &&
      <div>
        <a className="ui left ribbon label">
          <small>My Scripts</small>
        </a>
        <div style={{margin: '5px 0'}}>
          <Dropdown
            fluid search selection
            options={ this.options }
            placeholder='Select script from a list to import it'
            value=''
            selectOnBlur={false}
            onChange={ (a, b) => {
              this.props.includeLocalImport(b.value)
            }}
          />
        </div>
        <a className="ui left ribbon label">
          <small>Popular libraries</small>
        </a>
        <div style={{margin: '5px 0'}}>
          <Dropdown
            fluid search selection
            options={ this.popuplar }
            placeholder='Select script from a list to import it'
            value=''
            selectOnBlur={false}
            onChange={ (a, b) => {
              this.props.includeExternalImport(settings.editCode.popularLibs[b.value])
            }}
            />
        </div>
        <div>
          <small><i className="ui info circle icon black"></i><span className="cm-s-eclipse">You can import other user assets: <br />
            <code><span className="cm-keyword">import</span> <span className="cm-def">otherModule</span> <span className="cm-keyword">from</span> <span className="cm-string">'/!vault:CSSLoader'</span>
            </code>
          </span></small>
        </div>
        <div>
          <small><i className="ui info circle icon black"></i><span className="cm-s-eclipse">Hit Ctrl + Space to get list of user assets after typing '/name:' <br />
            <code><span className="cm-keyword">import</span> <span className="cm-def">otherModule</span> <span className="cm-keyword">from</span> <span className="cm-string">'/!vault:<span className="blink">|</span>'</span>
            </code>
          </span></small>
        </div>
      </div>
        }
      {!showExpanded && <a className="ui blue left ribbon label">
        <small>Quick import</small>
        </a>}
    </div>
  }
}
