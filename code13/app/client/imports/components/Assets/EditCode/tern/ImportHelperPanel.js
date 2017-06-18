import React, { PropTypes } from 'react'
import { Dropdown, Segment, Label, Icon } from 'semantic-ui-react'
import _ from 'lodash'
import settings from '/imports/SpecialGlobals'

export default class ImportHelperPanel extends React.Component {
  static propTypes = {
    scripts:       PropTypes.array, // list of scripts
    knownImports:  PropTypes.array, // list of known imports - won't show in the list
    includeImport: PropTypes.func,  // callback to import script
    assetName:     PropTypes.string
  }

  options = []  // TODO: move this to state. will have { text, description, value }
  popular = []  // TODO: move this to state. will have { text, description, value }

  constructor(...a) {
    super(...a)
    const savedState = parseInt(localStorage.getItem("EditCodeImportHelperPanelExtended"), 10)

    this.state = {
      showExpanded: savedState === null ? 0 : savedState
    }
    this.updateProps(this.props)
  }

  handleHideShowClick = () => {
    const next = this.state.showExpanded ? 0 : 1
    localStorage.setItem("EditCodeImportHelperPanelExtended", next)
    this.setState({"showExpanded": next})
  }

  shouldComponentUpdate(newP, newS) {
    if (this.state.showExpanded || newS.showExpanded) {
      this.lastUpdate = Date.now()
      return true
    }
    if (!this.lastUpdate) {
      this.lastUpdate = Date.now()
      return true
    }
    else {
      // don't update often than 1 sec  BUGBUG here
      if (Date.now() - this.lastUpdate > 1000) {
        this.lastUpdate = Date.now()
        return !_.isEqual(this.state, newS) || !_.isEqual(this.props, newP)
      }
      return false
    }
  }

  componentWillReceiveProps(props) {
    if (!_.isEqual(this.props, props))
      this.updateProps(props)
  }

  updateProps(props) {
    const checkIfImported = (s, global = false) => {
      if (props.knownImports) {
        const index = props.knownImports.findIndex( known => {
          if (global)
            return s.import === known.name
          else
            return s.text === known.name.substring(1)
        } )
        return index > -1
      }
      return false
    }

    const map = []
    if (props.scripts) {
      props.scripts.forEach(s => {
        if (checkIfImported(s))
          return
        map.push({text: s.text, description: s.desc, value: s.text})
      })
      this.options = _.uniqWith(map, _.isEqual)
    }

    const libs = settings.editCode.popularLibs
    this.popular = []
    libs.forEach( (s, i) => {
      if (checkIfImported(s, true))
        return
      this.popular.push({ text: s.name, description: s.desc, value: i})
    })
  }

  render() {

    const { scripts, includeLocalImport, includeExternalImport } = this.props
    const { showExpanded } = this.state

    if (!scripts || !scripts.length)
      return null

    return (
      <Segment color='blue' style={{backgroundColor: "rgba(160,32,240,0.03)", color: "#2A00FF"}}>

        <Label
            color='blue'
            corner='right'
            title={`Click to ${ showExpanded ? "hide" : "show" } import helper`}
            onClick={this.handleHideShowClick}
            icon={showExpanded ? "minus circle" : "add circle"} />

        {!!showExpanded &&
        <div>
          <Label className='left ribbon' content={<small>My Scripts</small>} />

          <div style={{margin: '5px 0'}}>
            <Dropdown
              fluid search selection
              options={ this.options }
              placeholder='Select script from list to import it'
              value=''
              selectOnBlur={false}
              onChange={ (a, b) => { includeLocalImport(b.value) }}
            />
          </div>

          <Label className='left ribbon' content={<small>Popular modules</small>} />

          <div style={{margin: '5px 0'}}>
            <Dropdown
              fluid search selection
              options={ this.popular }
              placeholder='Select script from list to import it'
              value=''
              selectOnBlur={false}
              onChange={ (a, b) => { includeExternalImport(settings.editCode.popularLibs[b.value]) }}
              />
          </div>
          <div>
            <small>
              <Icon name='info circle' color='black'/>
              <span className="cm-s-eclipse">You can import other user assets:
                <br />
                <code>
                  <span className="cm-keyword">import</span>&nbsp;
                  <span className="cm-def">otherModule</span>&nbsp;
                  <span className="cm-keyword">from</span>&nbsp;
                  <span className="cm-string">'/!vault:CSSLoader'</span>
                </code>
              </span>
            </small>
          </div>
          <div>
            <small>
              <Icon name='info circle' color='black'/>
              <span className="cm-s-eclipse">
                Hit Ctrl + Space to get list of user assets after typing '/username:'
                <br />
                <code>
                  <span className="cm-keyword">import</span>&nbsp;
                  <span className="cm-def">otherModule</span>&nbsp;
                  <span className="cm-keyword">from</span>&nbsp;
                  <span className="cm-string">'/!vault:<span className="blink">|</span>'</span>
                </code>
              </span>
            </small>
          </div>
        </div>
        }
        { !showExpanded &&
         <Label color='blue' className='left ribbon' content={<small>Quick import</small>} />
        }
      </Segment>
    )
  }
}
