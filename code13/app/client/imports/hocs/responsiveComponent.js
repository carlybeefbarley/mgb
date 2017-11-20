import cx from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import elementResizeDetectorMaker from 'element-resize-detector'
import { getDisplayName } from './hocUtils'

let elementResizeDetector

/**
 * Get component level responsive data.  Like media queries, but for components.
 * Instead of applying CSS styles, you get data back for the matching query.
 *
 * @example
 * const HomeRoute = ({ responsive: { width, height, activeRules, data, debug, isRuleActive } }) => (
 *   <div>
 *     {isRuleActive('small') ? 'ActiveRules:' : 'ResponsiveRulesThatCurrentlyMatch:'} {activeRules}
 *     <h3>Debug:</h3>
 *     {debug}
 *   </div>
 * )
 *
 * // Can also be a function that returns a rules object
 * const ResponsiveHome = responsiveComponent({
 *   small: {
 *     // 'small' is an arbitrary rule name. When the conditions are met, the inner Components's
 *     // this.props.activeRules array will contain this string, ['small'].  The wrapper div will
 *     // gain the className responsive-rule-small for easier debugging. Width/height values are in pixels.
 *     // Ranges are inclusive.
 *
 *     // minWidth=0 is default
 *     minWidth: 0,
 *
 *     // maxWidth=99999 is default
 *     maxWidth: 500,
 *   },
 *   medium: {
 *     minWidth: 400,
 *     maxWidth: 700,
 *     data: { columns: 1 }, // Optional. If present, and if the rule matches, this will be merged into data.
 *   },
 *   large: {
 *     minWidth: 700,
 *   },
 * })(HomeRoute)
 *
 * @param {object|function} [rules={}] - A rules object where keys are rule names and values are queries.
 *   Queries should contain min/max width/height values and optional `data`.
 * @param {string|function} WrappedComponent - A React component.
 * @returns {*}
 */
const responsiveComponent = (rules = {}) => WrappedComponent => {
  class ResponsiveComponent extends Component {
    static displayName = `responsiveComponent(${getDisplayName(WrappedComponent)})`

    state = {
      loaded: false,
      width: 0,
      height: 0,
      activeRules: [],
      data: {},
      debounced: true,
    }

    componentWillMount() {
      elementResizeDetector = elementResizeDetector || elementResizeDetectorMaker({ strategy: 'scroll' })
    }

    componentDidMount() {
      elementResizeDetector.listenTo(this.component, this.handleResize)
      if (!this.state.loaded) this.handleResize()
    }

    shouldComponentUpdate(nextProps, nextState) {
      return (
        nextState.debounced ||
        !this.state.loaded ||
        !_.isEmpty(_.difference(this.state.activeRules, nextState.activeRules))
      )
    }

    componentWillUnmount() {
      elementResizeDetector.removeListener(this.component, this.handleResize)
    }

    debounce = _.debounce(() => this.setState({ debounced: true }), 100)

    handleRef = ref => (this.ref = ref)

    handleResize = () => {
      if (!this.ref) return

      const { clientWidth, clientHeight } = this.ref
      const { activeRules, data } = this.matchRules(clientWidth, clientHeight)

      this.setState({
        loaded: true,
        debounced: false,
        width: clientWidth,
        height: clientHeight,
        activeRules,
        data,
      })

      this.debounce()
    }

    isRuleActive = ruleName => _.includes(this.state.activeRules, ruleName)

    matchRules = (newWidth, newHeight) => {
      const activeRules = []
      const data = {}

      const rulesObject = _.isFunction(rules) ? rules(this.props) : rules

      _.forOwn(rulesObject, (ruleValue, ruleName) => {
        var minWidth = ruleValue.minWidth || 0
        var maxWidth = ruleValue.maxWidth || 99999
        var minHeight = ruleValue.minHeight || 0
        var maxHeight = ruleValue.maxHeight || 99999

        if (
          ((ruleValue.minWidth || ruleValue.maxWidth) && (newWidth >= minWidth && newWidth <= maxWidth)) ||
          ((ruleValue.minHeight || ruleValue.maxHeight) && (newHeight >= minHeight && newHeight <= maxHeight))
        ) {
          activeRules.push(ruleName)
          if (_.isPlainObject(ruleValue.data)) Object.assign(data, ruleValue.data)
        }
      })

      return { activeRules, data }
    }

    render() {
      const { width, height, activeRules, data, loaded } = this.state
      const classNames = cx(..._.map(activeRules, ruleName => `responsive-rule-${ruleName}`))
      const styles = {
        wrapper: { height: '100%', position: 'relative' },
        component: { height: '100%' },
      }
      const debug = (
        <div>
          Width: {width}px activeRules: [ {activeRules}
          data:
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )
      const responsive = { activeRules, data, debug, height, isRuleActive: this.isRuleActive, width }

      return (
        <div ref={this.handleRef} style={{ ...styles.wrapper }}>
          <div
            ref={component => (this.component = component)}
            className={classNames}
            style={{ ...styles.component }}
          >
            {!loaded || width <= 0 ? null : <WrappedComponent {...this.props} responsive={responsive} />}
          </div>
        </div>
      )
    }
  }

  return ResponsiveComponent
}

// The propTypes we hand down to the wrapped component
responsiveComponent.propTypes = {
  responsive: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    activeRules: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.object.isRequired,
    debug: PropTypes.element.isRequired,
    isRuleActive: PropTypes.func.isRequired,
  }),
}

export default responsiveComponent
