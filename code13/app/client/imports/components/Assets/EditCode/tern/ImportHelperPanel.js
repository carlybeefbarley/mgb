import React, { PropTypes } from 'react'
import { Dropdown, Segment, Label, Icon } from 'semantic-ui-react'
import _ from 'lodash'
import settings from '/imports/SpecialGlobals'

export default class ImportHelperPanel extends React.Component {
  static propTypes = {
    scripts:               PropTypes.array,            // list of scripts
    knownImports:          PropTypes.array,            // list of known imports - won't show in the list
    includeLocalImport:    PropTypes.func.isRequired,  // callback to import script
    includeExternalImport: PropTypes.func.isRequired
  }

  options = []  // This is created when props update. Bit of an anti-pattern... { text, description, value }
  popular = []  // This is created when props update. Bit of an anti-pattern... { text, description, value }

  constructor(...a) {
    super(...a)
    const savedState = parseInt(localStorage.getItem("EditCodeImportHelperPanelExtended"), 10)

    this.state = {
      showExpanded: savedState === null ? 0 : savedState
    }
    this.updateOptionsFromProps(this.props)
  }

  handleHideShowClick = () => {
    const next = this.state.showExpanded ? 0 : 1
    localStorage.setItem("EditCodeImportHelperPanelExtended", next)
    this.setState( { "showExpanded": next } )
  }

  shouldComponentUpdate(newP, newS) {
    if (this.state.showExpanded || newS.showExpanded || !this.lastUpdate) {
      this.lastUpdate = Date.now()
      return true
    }
    // don't update often than 1 sec  BUGBUG here
    if (Date.now() - this.lastUpdate > 1000) {
      this.lastUpdate = Date.now()
      return !_.isEqual(this.state, newS) || !_.isEqual(this.props, newP)
    }
    return false
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props, nextProps))
      this.updateOptionsFromProps(nextProps)
  }

  updateOptionsFromProps( { knownImports, scripts } ) {
    this.popular = _
      .chain(settings.editCode.popularLibs)
      .map( ( lib, idx ) => ( { label: { content: lib.import, color: 'green', basic: true},
        description: lib.desc, value: idx } ) )
      .filter( lib => !_.some( knownImports, k => ( lib.label.content === k.name ) ) )
      .uniqWith(_.isEqual)
      .value()
    this.options = _
      .chain(scripts)
      .filter( s => !_.some( knownImports, k => ( s.text === k.name.substring(1) ) ) )
      .map(s => ( { label: s.text, description: s.desc, value: s.text } ) )
      .uniqWith(_.isEqual)
      .value()
  }

  render() {
    const { includeLocalImport, includeExternalImport } = this.props
    const { showExpanded } = this.state

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
          <Label ribbon content={<small>Recommended JavaScript packages to <code>import</code></small>} />

          <div style={{margin: '5px 0'}}>
            <Dropdown
              fluid search selection
              options={ this.popular }
              placeholder='Select package from list to import it'
              value=''
              selectOnBlur={false}
              onChange={ (a, b) => { includeExternalImport(settings.editCode.popularLibs[b.value]) }}
              />
          </div>


          <Label ribbon content={<small>My Scripts to <code>import</code></small>} />

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


          <div>
            <small>
              <Icon name='info circle' color='black'/>
              <span className="cm-s-eclipse">You can <code className="cm-keyword">import</code> other user's assets, e.g:
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
         <Label color='blue' ribbon content={<small><code>import</code> helper</small>} />
        }
      </Segment>
    )
  }
}
