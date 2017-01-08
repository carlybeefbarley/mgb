import _ from 'lodash'
import React, { PropTypes } from 'react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import { transformStep } from './JoyrideSpecialMacros'
import scroll from 'scroll'
import autobind from 'react-autobind'
import nested from 'nested-property'
import { getRootEl } from './utils'

import Beacon from './Beacon'
import Tooltip from './Tooltip'

export const joyrideCompleteTag = tagString => {
  if (!tagString.startsWith('mgbjr-CT-'))
    console.error(`Dev error: By convention, joyrideCompleteTag() params should start with "mgbjr-CT-".. Was called with an incorrect tag "${tagString}" instead..`)
  
   // enable using console if you want this noise:   m.jr._ctDebugSpew = true
  const event = new CustomEvent('mgbCompletionTag', { 'detail': tagString } )
  setTimeout(() => { window.dispatchEvent(event) }, 0) // Prevent setState during render if this was called due to render
}

 // Version that also provides { newSteps, errors } where errors is an array of { key: propertyName, val: UnrecognizedMacro}
export const parseStepsWithMacroResults = steps => {
  const newSteps = []
  const errors = []
  let tmpSteps = []

  if (_.isArray(steps)) {
    steps.forEach((s, idx) => {
      if (_.isObject(s) || _.isString(s)) {
        const s2 = transformStep(s)   // This gives us  { newStep{}, notFoundMacros[] }
        if (s2.notFoundMacros.length > 0) {
          console.log(`Step #${idx} contained unknown macros: `,s2.notFoundMacros)
          errors[idx] = s2.notFoundMacros
        }
        tmpSteps.push(s2.newStep)
      }
    })
  }
  else
    tmpSteps = [steps]

  tmpSteps.forEach((s) => {
    if (!s.selector)
      s.selector = 'body'  // safe default
    s.position = s.position || ( s.selector === 'body' ? 'top' : 'bottom')
    newSteps.push(s)
  })

  return { newSteps, errors }
}


const defaultState = {
  index:          0,
  play:           false,
  redraw:         true,
  showTooltip:    false,
  xPos:           -1000,
  yPos:           -1000,
  skipped:        false,
  stepIsWaiting:  false 
}

// Enhanced Step properties:
//        showStepOverlay: false / true / undefined
//        preparePage: 'action,action,action' - e.g. closeFlexPanels

const listeners = {
  tooltips: {}
}

let isTouch = false
if (typeof window !== 'undefined')
  isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints

export default class Joyride extends React.Component {
  constructor(props) {
    super(props)
    autobind(this)
    registerDebugGlobal( 'jr', this, __filename, 'The global joyride instance')
    this.state = defaultState
  }

  static propTypes = {
    callback:             PropTypes.func,
    completeCallback:     PropTypes.func,
    debug:                PropTypes.bool,
    disableOverlay:       PropTypes.bool,
    keyboardNavigation:   PropTypes.bool,
    resizeDebounce:       PropTypes.bool,
    resizeDebounceDelay:  PropTypes.number,
    run:                  PropTypes.bool,
    scrollOffset:         PropTypes.number,
    scrollToFirstStep:    PropTypes.bool,
    scrollToSteps:        PropTypes.bool,
    showBackButton:       PropTypes.bool,
    showOverlay:          PropTypes.bool,
    showSkipButton:       PropTypes.bool,
    showStepsProgress:    PropTypes.bool,
    stepCallback:         PropTypes.func,
    steps:                PropTypes.array,
    tooltipOffset:        PropTypes.number,
    type:                 PropTypes.string,
    locale:               PropTypes.object,
    preparePageHandler:   PropTypes.func          // App Provides these to handle step.preparePage strings
  };

  static defaultProps = {
    debug:                false,
    keyboardNavigation:   true,
    resizeDebounce:       false,
    resizeDebounceDelay:  200,
    run:                  false,
    scrollToSteps:        true,
    scrollOffset:         20,
    scrollToFirstStep:    false,
    showBackButton:       true,
    showOverlay:          true,
    showSkipButton:       false,
    showStepsProgress:    false,
    steps:                [],
    tooltipOffset:        15,
    type:                 'single',
    locale: {
      back:   'Back',
      close:  'Close',
      last:   'Done',
      next:   'Next',
      skip:   'Exit'
    }
  }

  componentDidMount() {
    const { keyboardNavigation, resizeDebounce, resizeDebounceDelay, type } = this.props

    this.logger('joyride:initialized', [this.props])

    // resize listener
    if (resizeDebounce) {
      let timeoutId
      listeners.resize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          timeoutId = null;
          this.calcPlacement();
        }, resizeDebounceDelay)
      }
    }
    else
      listeners.resize = () => { this.calcPlacement() }
    window.addEventListener('resize', listeners.resize)

    // mgbCompletionTag listener
    listeners.mgbCompletionTag = (e) => { 
      const step = this.props.steps[this.state.index]
      
      if (this._ctDebugSpew || this.props.debug)  // enable using console if you want this noise:   m.jr._ctDebugSpew = true
        this.logger('joyride:listeners.mgbCompletionTag  received: ', ['e.detail', e.detail ], false, true)
      
      if (step && step.awaitCompletionTag && step.awaitCompletionTag === e.detail)
      {
        this.logger('joyride:listeners.mgbCompletionTag - match and advance', ['awaitCompletionTag', step.awaitCompletionTag ])
        this.toggleTooltip(true, this.state.index+1, 'next')
      }
    }
    window.addEventListener('mgbCompletionTag', listeners.mgbCompletionTag)

    // appearing/disappearing listener
    listeners.handleTransience = () => {
      // Handle elements appearing and disappearing as Nav events happen etc.
      // This is done using a setInterval timer
      if (this.state.stepIsWaiting) {
        // Did it appear?
        this.toggleTooltip(true, this.state.index, 'appear' )
      }
      else 
      {
        // Did it disappear?
        const step = this.props.steps[this.state.index];
        if (step && !document.querySelector(step.selector))
          this.toggleTooltip(false, this.state.index, 'disappear' )
      }
    }
    listeners.handleTransience_intervalId = setInterval(listeners.handleTransience, 250)

    // keyboard Nav listener
    if (keyboardNavigation && type === 'continuous') {
      listeners.keyboard = this.onKeyboardNavigation
      document.body.addEventListener('keydown', listeners.keyboard)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { keyboardNavigation, run, steps } = this.props
    this.logger('joyride:willReceiveProps', [nextProps])

    if (nextProps.steps.length !== steps.length) {
      if (!nextProps.steps.length)
        this.reset()
      else if (nextProps.run)
        this.reset(true)
    }

    if (!run && nextProps.run && nextProps.steps.length)
      this.start()
    else if (run && nextProps.run === false)
      this.stop()

    if (
      !listeners.keyboard &&
      ((!keyboardNavigation && nextProps.keyboardNavigation) || keyboardNavigation)
      && nextProps.type === 'continuous'
    ) {
      listeners.keyboard = this.onKeyboardNavigation
      document.body.addEventListener('keydown', listeners.keyboard)
    }
    else if (
      listeners.keyboard && keyboardNavigation &&
      (!nextProps.keyboardNavigation || nextProps.type !== 'continuous')
    ) {
      document.body.removeEventListener('keydown', listeners.keyboard)
      delete listeners.keyboard
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const state = this.state;
    const { scrollToFirstStep, scrollToSteps } = this.props;
    const shouldScroll = scrollToFirstStep || (state.index > 0 || prevState.index > state.index);

    if (state.redraw)
      this.calcPlacement()

    if (state.play && scrollToSteps && shouldScroll)
      scroll.top(getRootEl(), this.getScrollTop())
  }

  componentWillUnmount() {
    window.removeEventListener('resize', listeners.resize)
    window.removeEventListener('mgbCompletionTag', listeners.mgbCompletionTag)
    clearInterval(listeners.handleTransience_intervalId)

    if (listeners.keyboard)
      document.body.removeEventListener('keydown', listeners.keyboard)

    if (Object.keys(listeners.tooltips).length) {
      Object.keys(listeners.tooltips).forEach((key) => {
        document.querySelector(key).removeEventListener(listeners.tooltips[key].event, listeners.tooltips[key].cb)
        delete listeners.tooltips[key]
      })
    }
  }

  /**
   * Starts the tour
   *
   * @param {boolean} [autorun]- Starts with the first tooltip opened
   */
  start(autorun) {
    const autoStart = autorun === true
    this.logger('joyride:start', ['autorun:', autoStart])
    this.setState({ play: true }, () => { if (autoStart) this.toggleTooltip(true) } )
  }

  /**
   * Stop the tour
   */
  stop() {
    this.logger('joyride:stop')
    this.setState( { showTooltip: false, play: false } )
  }

  /**
   * Reset Tour
   *
   * @param {boolean} [restart] - Starts the new tour right away
   */
  reset(restart) {
    const shouldRestart = (restart === true)

    const newState = JSON.parse(JSON.stringify(defaultState))
    newState.play = shouldRestart

    this.logger('joyride:reset', ['restart:', shouldRestart])

    // Force a re-render if necessary
    if (shouldRestart && this.state.play === shouldRestart && this.state.index === 0)
      this.forceUpdate()

    this.setState(newState)
  }

  /**
   * Retrieve the current progress of your tour
   *
   * @returns {{index: (number|*), percentageComplete: number, step: (object|null)}}
   */
  getProgress() {
    const state = this.state
    const { steps } = this.props

    this.logger('joyride:getProgress', ['steps:', steps])

    return {
      index: state.index,
      percentageComplete: parseFloat(((state.index / steps.length) * 100).toFixed(2).replace('.00', '')),
      step: steps[state.index]
    }
  }

  /**
   * Parse the incoming steps
   *
   * @param {Array|Object} steps
   * @returns {Array}
   */
  parseSteps(steps) {
    return parseStepsWithMacroResults(steps).newSteps
  }


  /**
   * Add Tooltip events
   *
   * @param {Object} data
   */
  addTooltip(data) {
    const parseData = this.parseSteps(data);
    let newData;
    let el;
    let eventType;
    let key;

    this.logger('joyride:addTooltip', ['data:', data]);

    if (parseData.length) {
      newData = parseData[0];
      key = newData.trigger || newData.selector;
      el = document.querySelector(key);
      eventType = newData.event || 'click';
    }

    if (!el)
      return

    el.setAttribute('data-tooltip', JSON.stringify(data));

    if (eventType === 'hover' && !isTouch) {
      listeners.tooltips[key] = { event: 'mouseenter', cb: this.onClickStandaloneTrigger };
      listeners.tooltips[`${key}mouseleave`] = { event: 'mouseleave', cb: this.onClickStandaloneTrigger };
      listeners.tooltips[`${key}click`] = {
        event: 'click',
        cb: (e) => {
          e.preventDefault();
        }
      };

      el.addEventListener('mouseenter', listeners.tooltips[key].cb);
      el.addEventListener('mouseleave', listeners.tooltips[`${key}mouseleave`].cb);
      el.addEventListener('click', listeners.tooltips[`${key}click`].cb);
    }
    else {
      listeners.tooltips[key] = { event: 'click', cb: this.onClickStandaloneTrigger };
      el.addEventListener('click', listeners.tooltips[key].cb);
    }
  }

  /**
   * Log method calls if debug is enabled
   *
   * @private
   * @param {string} type
   * @param {string|Array} [msg]
   * @param {boolean} [warn]
   */
  logger(type, msg, warn, forceShow = false) {
    const { debug } = this.props
    const logger = warn ? console.warn || console.error : console.log; //eslint-disable-line no-console

    if (debug || forceShow) {
      console.log(`%c${type}`, 'color: #760bc5; font-weight: bold; font-size: 12px;'); //eslint-disable-line no-console
      if (msg)
        logger.apply(console, msg)
    }
  }

  /**
   * Get an element actual dimensions with margin
   *
   * @private
   * @param {String|Element} el - Element node or selector
   * @returns {{height: number, width: number}}
   */
  getElementDimensions(el) {
    // Get the DOM Node if you pass in a string
    const newEl = (typeof el === 'string') ? document.querySelector(el) : el;
    let height = 0;
    let width = 0;

    if (newEl) {
      const styles = window.getComputedStyle(newEl);
      height = newEl.clientHeight + parseInt(styles.marginTop, 10) + parseInt(styles.marginBottom, 10);
      width = newEl.clientWidth + parseInt(styles.marginLeft, 10) + parseInt(styles.marginRight, 10);
    }

    return { height, width }
  }

  /**
   * Get the scrollTop position
   *
   * @private
   * @returns {number}
   */
  getScrollTop() {
    const state = this.state
    const { scrollOffset, steps } = this.props
    const step = steps[state.index]
    const target = document.querySelector(step.selector)

    if (!target)
      return 0

    const rect = target.getBoundingClientRect()
    const targetTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop)
    const position = this.calcPosition(step)
    let scrollTo = 0

    if (/^top/.test(position))
      scrollTo = Math.floor(state.yPos - scrollOffset)
    else if (/^bottom|^left|^right/.test(position))
      scrollTo = Math.floor(targetTop - scrollOffset)

    return scrollTo
  }

  /**
   * Keydown event listener
   *
   * @private
   * @param {Event} e - Keyboard event
   */
  onKeyboardNavigation(e) {
    const state = this.state
    const { steps } = this.props
    const intKey = (window.Event) ? e.which : e.keyCode
    let hasSteps

    if (state.showTooltip) {
      if ([13, 27, 38, 40].indexOf(intKey) > -1)
        e.preventDefault()

      if (intKey === 27)
        this.toggleTooltip(false, state.index + 1, 'esc')
      else if ([13].indexOf(intKey) > -1) {
        hasSteps = Boolean(steps[state.index + 1]);
        this.toggleTooltip(hasSteps, state.index + 1, 'next');
      }
    }
  }

  /**
   * Tooltip event listener
   *
   * @private
   * @param {Event} e - Click event
   */
  onClickStandaloneTrigger(e) {
    e.preventDefault()
    let tooltip = e.currentTarget.dataset.tooltip

    if (tooltip) {
      tooltip = JSON.parse(tooltip)

      if (!this.state.tooltip || (this.state.tooltip.selector !== tooltip.selector)) {
        this.setState({
          previousPlay: this.state.previousPlay !== undefined ? this.state.previousPlay : this.state.play,
          play: false,
          showTooltip: false,
          position: undefined,
          tooltip,
          xPos: -1000,
          yPos: -1000
        })
      }
      else
        document.querySelector('.joyride-tooltip__close').click()
    }
  }

  onRenderTooltip() {
    this.calcPlacement()
  }

  /**
   * Beacon click event listener
   *
   * @private
   * @param {Event} e - Click event
   */
  onClickBeacon(e) {
    e.preventDefault()
    const state = this.state
    const { callback, steps } = this.props

    if (typeof callback === 'function')
      callback({
        action: 'beacon',
        type: 'step:before',
        step: steps[state.index]
      })

    this.toggleTooltip(true, state.index)
  }

  /**
   * Tooltip click event listener
   *
   * @private
   * @param {Event} e - Click event
   */
  onClickTooltip(e) {
    const state = this.state
    const { callback, steps, type } = this.props
    const el = e.currentTarget.className.indexOf('joyride-') === 0 && e.currentTarget.tagName === 'A' ? e.currentTarget : e.target
    const dataType = el.dataset.type

    if (el.className.indexOf('joyride-') === 0) {
      if (dataType === 'next' && steps[state.index] && steps[state.index].awaitCompletionTag)
      {
        // a step.awaitCompletionTag property such as 
        //      awaitCompletionTag: 'mgbjr-CT-flexPanelIcons-assets-show'
        // will disable Next, and instead wait for the real action to ocurr. 
        this.logger(`joyride:onClickTooltip: next-awaitCompletionTag`, ['step.awaitCompletionTag:', steps[state.index].awaitCompletionTag ] )
        return 
        // Note that we don't call   e.preventDefault() ;  e.stopPropagation() since we want to pass the clicks on to what might do the task requested
        // However.. this is all a bit odd.. React SyntheticEvents don't propagate in the same way as browser's native events...
      }
      e.preventDefault()
      e.stopPropagation()
      const tooltip = document.querySelector('.joyride-tooltip')
      if (dataType === 'next' && steps[state.index] && steps[state.index].code)
      {
        const code = steps[state.index].code
        this.logger(`joyride:onClickTooltip: next-code`, ['step.code:', steps[state.index].code ] )
        const event = new CustomEvent('mgbjr-stepAction-appendCode', { 'detail': code } )
        window.dispatchEvent(event)
      }
      let newIndex = state.index + (dataType === 'back' ? -1 : 1)

      if (dataType === 'skip') {
        this.setState({  skipped: true })
        newIndex = steps.length + 1
      }

      if (tooltip.classList.contains('joyride-tooltip--standalone')) {
        this.setState({
          play: this.state.previousPlay,
          previousPlay: undefined,
          tooltip: undefined,
          redraw: true
        })
      }
      else if (dataType) {
        const shouldDisplay = ['continuous', 'guided'].indexOf(type) > -1
          && ['close', 'skip'].indexOf(dataType) === -1
          && Boolean(steps[newIndex])

        this.toggleTooltip(shouldDisplay, newIndex, dataType)
      }

      if (e.target.className === 'joyride-overlay') {
        if (typeof callback === 'function') {
          callback({
            action: 'click',
            type: 'overlay',
            step: steps[state.index]
          })
        }
      }
    }
  }

  /**
   * Toggle Tooltip's visibility
   *
   * @private
   * @param {Boolean} show - Render the tooltip or the beacon
   * @param {Number} [index] - The tour's new index
   * @param {string} [action]
   */
  toggleTooltip(show, index, action) {
    const { callback, completeCallback, stepCallback, steps, preparePageHandler } = this.props
    let newIndex = (index !== undefined ? index : this.state.index)
    const step = steps[newIndex]

    // Note that the listeners.handleTransience() timer will call this 
    // function frequently when  (this.state.stepIsWaiting === true)
    // so this function should be idempotent, quiet and inexpensive if there are
    // no changes to be applied when in that state

    if (!this.state.stepIsWaiting && step && step.preparePage) {
      if (!preparePageHandler)
        console.warn(`Step #${newIndex} has step.preparePage='${step.preparePage}' but there is no registered preparePageHandler()`)
      else
      {
        const prepResult = preparePageHandler(step.preparePage)
        if (prepResult)
          console.warn(`Step #${newIndex} has step.preparePage='${step.preparePage}' but the result from preparePageHandler() was '${prepResult}'`)
        else
          this.logger(`joyride:toggleTooltip: preparePageHandler`, ['step.preparePage:', step.preparePage, 'prepResult:', prepResult]) 
      }  
    }

    if (step && !document.querySelector(step.selector)) {

      this.setState({
        showTooltip: false,
        index: newIndex,
        play: false,
        stepIsWaiting: true
      })

      return
    }

    this.setState({
      play: this.state.stepIsWaiting ? true : (step ? this.state.play : false),
      stepIsWaiting: false,      
      showTooltip: show,
      index: newIndex,
      position: undefined,
      redraw: true, //!show,
      xPos: -1000,
      yPos: -1000
    }, () => {
      const lastIndex = action === 'back' ? newIndex + 1 : newIndex - 1;

      if (action && steps[lastIndex] && (typeof callback === 'function'))
        callback( { action, type: 'step:after', step: steps[lastIndex], newIndex } )

      if (steps.length && !steps[newIndex]) {
        if (typeof completeCallback === 'function')
          completeCallback(steps, this.state.skipped)  // Deprecated

        if (typeof callback === 'function')
          callback( { action, type: 'finished', steps, skipped: this.state.skipped } )
      }
    })
  }

  /**
   * Position absolute elements next to its target
   *
   * @private
   */
  calcPlacement() {
    const state = this.state
    const { steps, tooltipOffset } = this.props
    const step = state.tooltip ? state.tooltip : (steps[state.index] || {})
    const showTooltip = state.tooltip ? true : state.showTooltip
    const target = document.querySelector(step.selector)
    const placement = { x: -1000, y: -1000 }

    this.logger(`joyride:calcPlacement${this.getRenderStage()}`, ['step:', step])

    if (!target)
      return

    if (step && (state.tooltip || (state.play && steps[state.index]))) {
      const offsetX = nested.get(step, 'style.beacon.offsetX') || 0
      const offsetY = nested.get(step, 'style.beacon.offsetY') || 0
      const position = this.calcPosition(step)
      const body = document.body.getBoundingClientRect()
      const component = this.getElementDimensions(showTooltip ? '.joyride-tooltip' : '.joyride-beacon')
      const rect = target.getBoundingClientRect()

      // Calculate x position
      if (/^left/.test(position))
        placement.x = rect.left - (showTooltip ? component.width + tooltipOffset : (component.width / 2) + offsetX)
      else if (/^right/.test(position))
        placement.x = (rect.left + rect.width) - (showTooltip ? -tooltipOffset : (component.width / 2) - offsetX)
      else
        placement.x = rect.left + ((rect.width / 2) - (component.width / 2))

      // Calculate y position
      if (/^top/.test(position))
        placement.y = (rect.top - body.top) - (showTooltip ? component.height + tooltipOffset : (component.height / 2) + offsetY)
      else if (/^bottom/.test(position))
        placement.y = (rect.top - body.top) + (rect.height - (showTooltip ? -tooltipOffset : (component.height / 2) - offsetY))
      else 
        placement.y = (rect.top - body.top)

      if (/^bottom|^top/.test(position)) {
        if (/left/.test(position))
          placement.x = rect.left - (showTooltip ? tooltipOffset : component.width / 2)
        else if (/right/.test(position))
          placement.x = rect.left + (rect.width - (showTooltip ? component.width - tooltipOffset : component.width / 2))
      }

      this.setState({
        xPos: this.preventWindowOverflow(Math.ceil(placement.x), 'x', component.width, component.height),
        yPos: this.preventWindowOverflow(Math.ceil(placement.y), 'y', component.width, component.height),
        redraw: false
      })
    }
  }

  /**
   * Update position for small screens.
   *
   * @private
   * @param {Object} step
   *
   * @returns {string}
   */
  calcPosition(step) {
    const { tooltipOffset } = this.props
    const showTooltip = this.state.tooltip ? true : this.state.showTooltip
    const body = document.body.getBoundingClientRect()
    const target = document.querySelector(step.selector)
    const component = this.getElementDimensions((showTooltip ? '.joyride-tooltip' : '.joyride-beacon'))
    const rect = target.getBoundingClientRect()
    let position = step.position;

    if (step.selector !== 'body')
    {
      this.logger('joyride:calcPosition', ['step:', step, 'component:', component, 'rect:', rect])

      if (/^left/.test(position) && rect.left - (component.width + tooltipOffset) < 0)
        position = 'top'
      else if (/^right/.test(position) && (rect.left + rect.width + (component.width + tooltipOffset)) > body.width) 
        position = 'bottom'
    }

    return position
  }

  getRenderStage() {
    if (this.state.redraw)
      return ':redraw'
    else if (this.state.xPos < 0)
      return ':pre-render'
    return ''
  }

  /**
   * Prevent tooltip to render outside the window
   *
   * @private
   * @param {Number} value - The axis position
   * @param {String} axis - The Axis X or Y
   * @param {Number} elWidth - The target element width
   * @param {Number} elHeight - The target element height
   * @returns {Number}
   */
  preventWindowOverflow(value, axis, elWidth, elHeight) {
    const winWidth = window.innerWidth
    const body = document.body
    const html = document.documentElement
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    let newValue = value

    if (axis === 'x') {
      if (value + elWidth >= winWidth)
        newValue = winWidth - elWidth - 15
      else if (value < 15)
        newValue = 15
    }
    else if (axis === 'y') {
      if (value + elHeight >= docHeight)
        newValue = docHeight - elHeight - 15
      else if (value < 15)
        newValue = 15
    }

    return newValue
  }

  /**
   * Create a React Element
   *
   * @private
   * @returns {*}
   */
  createComponent() {
    const state = this.state
    const { disableOverlay, locale, showBackButton, showOverlay, showSkipButton, showStepsProgress, steps, type } = this.props
    const currentStep = Object.assign({}, state.tooltip || steps[state.index])
    const target = currentStep && currentStep.selector ? document.querySelector(currentStep.selector) : null
    const cssPosition = target ? target.style.position : null
    const shouldShowOverlay = state.tooltip ? false : 
      ( (currentStep && (currentStep.showStepOverlay === true || currentStep.showStepOverlay === false) ) 
        ? currentStep.showStepOverlay 
        : showOverlay)
    const buttons = { primary: locale.close }
    let component

    this.logger(`joyride:createComponent${this.getRenderStage()}`, [
      'component:', state.showTooltip || state.tooltip ? 'Tooltip' : 'Beacon',
      'animate:', state.xPos > -1 && !state.redraw,
      'step:', currentStep
    ], !target)

    if (!target)
      return false

    if (state.showTooltip || state.tooltip) {
      currentStep.position = this.calcPosition(currentStep)

      if (!state.tooltip) {
        if (['continuous', 'guided'].indexOf(type) > -1) {

          if (currentStep.code)
            buttons.primary = (<span>Insert Code</span>)          
          else if (currentStep.awaitCompletionTag)
            buttons.primary = null // (<span onClick={(e) => { $(e.target).text('Not this.. that!') } }>Do It</span>)
          else
          {
            buttons.primary = locale.last

            if (steps[state.index + 1]) {
              if (showStepsProgress) {
                let next = locale.next
                if (typeof locale.next === 'string')
                  next = (<span>{locale.next}</span>)
                buttons.primary = (<span>{next} <span>{`${(state.index + 1)}/${steps.length}`}</span></span>)
              }
              else
                buttons.primary = locale.next
            }

            if (showBackButton && state.index > 0)
              buttons.secondary = locale.back
          }
        }

        if (showSkipButton)
          buttons.skip = locale.skip
      }

      component = React.createElement(Tooltip, {
        animate:      state.xPos > -1 && !state.redraw,
        step:         currentStep,
        showOverlay:  shouldShowOverlay,
        buttons,
        cssPosition,
        disableOverlay,
        standalone: Boolean(state.tooltip),
        disableArrow: currentStep.selector === 'body',
        type,
        xPos:         state.xPos,
        yPos:         state.yPos,
        onClick:      this.onClickTooltip,
        onRender:     this.onRenderTooltip
      })
    }
    else
      component = React.createElement(Beacon, {
        cssPosition,
        step: currentStep,
        xPos: state.xPos,
        yPos: state.yPos,
        onTrigger: this.onClickBeacon,
        eventType: currentStep.type || 'click'
      })

    return component
  }

  render() {
    const { index, play, tooltip } = this.state
    const { steps } = this.props
    const hasStep = Boolean(steps[index])
    let component
    let standaloneTooltip

    if (play && hasStep)
      this.logger(`joyride:render${this.getRenderStage()}`, ['step:', steps[index]])
    else if (!play && tooltip) 
      this.logger('joyride:render', ['tooltip:', tooltip])

    if (tooltip)
      standaloneTooltip = this.createComponent()
    else if (play && hasStep) 
      component = this.createComponent()

    return (
      <div className="joyride">
        {component}
        {standaloneTooltip}
      </div>
    )
  }
}