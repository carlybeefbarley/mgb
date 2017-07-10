import _ from 'lodash'
import React from 'react'
import elementResizeDetectorMaker from 'element-resize-detector'

let _erd
const _ResponsiveRulesClassPrefix = 'rrc-'
export default function(Component, wrapperStyles = {}, componentStyles = {}) {
  class ResponsiveComponent extends React.Component {
    constructor() {
      super()
      if (!_erd) {
        _erd = elementResizeDetectorMaker({ strategy: 'scroll' })
      }
      this.state = {
        loaded: false,
        width: 0,
        height: 0,
        activeRules: [],
        respData: {},
        debounced: true,
      }

      this.debounce = _.debounce(function() {
        this.setState({ debounced: true })
      }, 100)
      this.handleResize = this.handleResize.bind(this)
      this.isRuleActive = this.isRuleActive.bind(this)
    }

    handleResize() {
      const wrapper = this.wrapper
      const { activeRules, respData } = this.matchRules(wrapper.clientWidth, wrapper.clientHeight)
      this.setState({
        loaded: true,
        debounced: false,
        width: wrapper.clientWidth,
        height: wrapper.clientHeight,
        activeRules,
        respData,
      })
      this.debounce()
    }

    matchRules(newWidth, newHeight) {
      const rr = Component.responsiveRules // Can be undefined/null, function returning object, or object
      const responsiveRules = _.isFunction(rr) ? rr() : rr
      var activeRules = []
      var respData = {}

      _.forOwn(responsiveRules, (ruleValue, ruleName) => {
        var minWidth = ruleValue.minWidth || 0
        var maxWidth = ruleValue.maxWidth || 99999
        var minHeight = ruleValue.minHeight || 0
        var maxHeight = ruleValue.maxHeight || 99999

        if (
          ((ruleValue.minWidth || ruleValue.maxWidth) && (newWidth >= minWidth && newWidth <= maxWidth)) ||
          ((ruleValue.minHeight || ruleValue.maxHeight) && (newHeight >= minHeight && newHeight <= maxHeight))
        ) {
          activeRules.push(ruleName)
          if (_.isPlainObject(ruleValue.respData)) Object.assign(respData, ruleValue.respData)
        }
      })

      return { activeRules, respData }
    }

    componentDidMount() {
      _erd.listenTo(this.component, this.handleResize)
      if (!this.state.loaded) this.handleResize()
    }

    shouldComponentUpdate(nextProps, nextState) {
      return (
        !this.state.loaded ||
        !_.isEqual(this.state.activeRules, nextState.activeRules) ||
        nextState.debounced === true
      )
    }

    componentWillUnmount() {
      _erd.removeListener(this.component, this.handleResize)
    }

    isRuleActive(ruleName) {
      return this.state.activeRules.indexOf(ruleName) > -1
    }

    render() {
      const { width, height, activeRules, respData, loaded } = this.state
      const classNames = _.join(_.map(activeRules, rn => _ResponsiveRulesClassPrefix + rn), ' ')
      const styles = {
        wrapper: { height: '100%', position: 'relative' },
        component: { height: '100%' },
      }

      return (
        <div ref={wrapper => (this.wrapper = wrapper)} style={{ ...styles.wrapper, ...wrapperStyles }}>
          <div
            ref={component => (this.component = component)}
            className={classNames}
            style={{ ...styles.component, ...componentStyles }}
          >
            {!loaded || width <= 0
              ? null
              : <Component
                  {...this.props}
                  respWidth={width}
                  respHeight={height}
                  respActiveRules={activeRules}
                  respData={respData}
                  respDebug={
                    <div>
                      Width: {width}px activeRules: [ {activeRules && activeRules.join(',')} ] respData:{' '}
                      {JSON.stringify(respData)}
                    </div>
                  }
                  respIsRuleActive={this.isRuleActive}
                />}
          </div>
        </div>
      )
    }
  }

  return ResponsiveComponent
}

/*

Usage Example:

const HomeRoute = ( { respActiveRules, respIsRuleActive } ) => {
  return (
    <div>
      { respIsRuleActive('small') ? 'ActiveRules:' : 'ResponsiveRulesThatCurrentlyMatch:'} { respActiveRules }
    </div>
  )
}

HomeRoute.responsiveRules = {  // Note that this could also be a function that returns this kind of object
  'small': {  
    // 'small' is a responsiveRule name. When the conditions are met,
    //  the inner Components's respActiveRules property (array) will contain 
    //  this string.  Also, the wrapper div will gain the className rrc-small 
    //  The rrc- prefix stands for ResponsiveRuleClass- so it is easier to debug
    minWidth: 0,      // Values are in pixels, and ranges are inclusive. minWidth=0 is default
    maxWidth: 500     // maxWidth=99999 is default 
  },
  'medium': {
    minWidth: 400,
    maxWidth: 700,
    respData: { columns: 1 }  // Optional. If present, and if the rule matches, this will be merged into respData. ORDER IS NOT GUARANTEED
  },
  'large': {
    minWidth: 700
  }
}


const ResponsiveHome = ResponsiveComponent(HomeRoute)


*/
