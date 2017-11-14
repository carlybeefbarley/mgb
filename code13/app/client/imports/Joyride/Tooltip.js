import PropTypes from 'prop-types'
import React from 'react'
import { browser } from './utils'
import _ from 'lodash'

// This is to support the format where step.selectors = sel1,sel2, .... selN
// This implementation looks for *visible* elements selected by  sel1 frst, then sel2 etc...
export const _queryVisibleSelectorsInSequence = selectors => {
  if (!selectors || selectors === '') return null
  const selArr = _.split(selectors, ',')
  for (let sel of selArr) {
    const el = document.querySelector(sel)
    if (
      el &&
      (sel === 'body' || el.offsetParent !== null || el.style.position === 'fixed') // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
    )
      return el
  }
  return null
}

export default class JoyrideTooltip extends React.Component {
  static propTypes = {
    animate: PropTypes.bool.isRequired, // if true, adds class 'joyride-tooltip--animate'
    buttons: PropTypes.object.isRequired,
    cssPosition: PropTypes.string.isRequired, // if 'fixed' then position will be fixed, otherwise absolute
    onClick: PropTypes.func.isRequired,
    onRender: PropTypes.func.isRequired,
    disableArrow: PropTypes.bool,
    disableOverlay: PropTypes.bool, // ?? If true, the overlay has no effect..  pointer-events=none  etc
    showOverlay: PropTypes.bool.isRequired, // If true, show the overlay (i.e. the non-hole and the hole)
    step: PropTypes.object.isRequired, // .selector ; .position ; .style ; .title ; .event ('hover' or 'click') ; .imageSrc ; .imgRightSrc
    type: PropTypes.string.isRequired, // 'single' or 'casual' or ????
    xPos: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    yPos: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }

  static defaultProps = {
    buttons: {
      primary: 'Close',
    },
    cssPosition: 'absolute',
    step: {},
    xPos: -1000,
    yPos: -1000,
  }

  componentDidMount() {
    this.forceUpdate(this.props.onRender)
  }

  componentDidUpdate(prevProps) {
    const { onRender, step } = this.props

    if (prevProps.step.selector !== step.selector) this.forceUpdate(onRender)
  }

  // This is going to return a percentage as a number.. ie. 0...100
  getArrowPosition(arrowPosition) {
    return _.clamp(arrowPosition, 8, 92)
  }

  generateArrow(opts = {}) {
    let width
    let height
    let rotate

    opts.location = opts.location || 'top'
    opts.color = opts.color || '#f04'
    opts.color = opts.color.replace('#', '%23')

    opts.width = opts.width || 36 // I think 36 is the width of the beacon
    opts.height = opts.width / 2
    opts.scale = opts.width / 16
    opts.rotate = '0'

    height = opts.height
    rotate = opts.rotate
    width = opts.width

    if (opts.location === 'bottom') rotate = '180 8 4'
    else if (opts.location === 'left') {
      height = opts.width
      width = opts.height
      rotate = '270 8 8'
    } else if (opts.location === 'right') {
      height = opts.width
      width = opts.height
      rotate = '90 4 4'
    }

    // By default, this SVG represents an upward pointing triangle.
    //  It's internal size is 16 wide x 8 high.
    //  It gets scaled to the dialog box size via the opts.scale math
    //  It will be positioned along the tooltip box via the % returned
    //    later by getArrowPosition().. which is used by setStyles()
    return `data:image/svg+xml,%3Csvg%20width%3D%22${width}%22%20height%3D%22${height}%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolygon%20points%3D%220%2C%200%208%2C%208%2016%2C0%22%20fill%3D%22${opts.color}%22%20transform%3D%22scale%28${opts.scale}%29%20rotate%28${rotate}%29%22%3E%3C%2Fpolygon%3E%3C%2Fsvg%3E`
  }

  setStyles(stepStyles, opts) {
    const { cssPosition, xPos, yPos } = this.props
    const styles = {
      arrow: { left: opts.arrowPosition },
      buttons: {},
      header: { marginBottom: '0.5em' },
      hole: {},
      tooltip: {
        position: cssPosition === 'fixed' ? 'fixed' : 'absolute',
        top: Math.round(yPos - 8), // Note that this gets adjusted later - see styles.tooltip.top
        left: Math.round(xPos),
        pointerEvents: 'auto',
      },
    }

    if (opts.positionBaseClass === 'left' || opts.positionBaseClass === 'right')
      styles.tooltip.top += _.clamp(opts.rect.height / 2 - 32, 0, Math.min(64, opts.rect.height * 0.8))

    if (styles.tooltip.top < 16) styles.tooltip.top = 16

    styles.hole = {
      top: Math.round(opts.rect.top - document.body.getBoundingClientRect().top - 5),
      left: Math.round(opts.rect.left - 5),
      width: Math.round(opts.rect.width + 10),
      height: Math.round(opts.rect.height + 10),
      pointerEvents: 'none',
    }

    styles.buttons = {
      back: {},
      close: {},
      primary: {},
      skip: {},
    }

    /* Styling */
    if (stepStyles) {
      if (stepStyles.backgroundColor) {
        styles.arrow.backgroundImage = `url("${this.generateArrow({
          location: opts.positionBaseClass,
          color: stepStyles.backgroundColor,
        })}")`
        styles.tooltip.backgroundColor = stepStyles.backgroundColor
      }

      if (stepStyles.borderRadius) styles.tooltip.borderRadius = stepStyles.borderRadius

      if (stepStyles.color) {
        styles.buttons.primary.color = stepStyles.color
        styles.buttons.close.color = stepStyles.color
        styles.buttons.skip.color = stepStyles.color
        styles.header.color = stepStyles.color
        styles.tooltip.color = stepStyles.color

        if (stepStyles.mainColor && stepStyles.mainColor === stepStyles.color)
          styles.buttons.primary.color = stepStyles.backgroundColor
      }

      if (stepStyles.mainColor) {
        styles.buttons.primary.backgroundColor = stepStyles.mainColor
        styles.buttons.back.color = stepStyles.mainColor
        styles.header.borderColor = stepStyles.mainColor
      }

      if (stepStyles.boxShadow) {
        styles.tooltip.boxShadow = stepStyles.boxShadow
      }

      if (stepStyles.textAlign) styles.tooltip.textAlign = stepStyles.textAlign

      if (stepStyles.width) styles.tooltip.width = stepStyles.width

      if (stepStyles.back) styles.buttons.back = Object.assign({}, styles.buttons.back, stepStyles.back)

      if (stepStyles.button)
        styles.buttons.primary = Object.assign({}, styles.buttons.primary, stepStyles.button)

      if (stepStyles.close) styles.buttons.close = Object.assign({}, styles.buttons.close, stepStyles.close)

      if (stepStyles.skip) styles.buttons.skip = Object.assign({}, styles.buttons.skip, stepStyles.skip)

      if (stepStyles.hole) styles.hole = Object.assign({}, stepStyles.hole, styles.hole)
    }

    return styles
  }

  setOpts() {
    const { animate, step, xPos } = this.props

    const target = _queryVisibleSelectorsInSequence(step.selector)
    const tooltip = document.querySelector('.joyride-tooltip')

    const opts = {
      classes: ['joyride-tooltip'], // classes for the tooltip. It can also get joyride-tooltip--animate
      rect: target.getBoundingClientRect(), // rect for the thing we are pointing to (note, it could be 'body')
      positionClass: step.position,
    }

    opts.positionBaseClass = opts.positionClass.match(/-/)
      ? opts.positionClass.split('-')[0]
      : opts.positionClass

    if ((/^bottom/.test(opts.positionClass) || /^top/.test(opts.positionClass)) && xPos > -1) {
      opts.tooltip = { width: 450 }

      if (tooltip) opts.tooltip = tooltip.getBoundingClientRect()

      opts.targetMiddle = opts.rect.left + opts.rect.width / 2
      opts.arrowPosition = ((opts.targetMiddle - xPos) / opts.tooltip.width * 100).toFixed(2)
      opts.arrowPosition = `${this.getArrowPosition(opts.arrowPosition)}%`
    }

    if (opts.positionBaseClass !== opts.positionClass) opts.classes.push(opts.positionBaseClass)

    opts.classes.push(opts.positionClass)

    if (animate) opts.classes.push('joyride-tooltip--animate')

    return opts
  }

  render() {
    const { buttons, disableOverlay, onClick, showOverlay, disableArrow, step, type } = this.props
    const target = _queryVisibleSelectorsInSequence(step.selector)

    if (!target) return undefined

    const opts = this.setOpts()
    const styles = this.setStyles(step.style, opts)
    const output = {}

    if (step.title) {
      output.header = (
        <div className="joyride-tooltip__header" style={styles.header}>
          {step.title}
        </div>
      )
    }

    if (buttons.skip) {
      output.skip = (
        <a
          href="#"
          className="joyride-tooltip__button joyride-tooltip__button--skip"
          style={styles.buttons.skip}
          data-type="skip"
          onClick={onClick}
        >
          {buttons.skip}
        </a>
      )
    }

    if (!step.text || typeof step.text === 'string')
      output.main = (
        <div className="joyride-tooltip__main" dangerouslySetInnerHTML={{ __html: step.text || '' }} />
      )
    else output.main = <div className="joyride-tooltip__main">{step.text}</div>

    if (buttons.secondary)
      output.secondary = (
        <a
          href="#"
          className="joyride-tooltip__button joyride-tooltip__button--secondary"
          style={styles.buttons.back}
          data-type="back"
          onClick={onClick}
        >
          {buttons.secondary}
        </a>
      )

    if (step.event === 'hover') styles.buttons.close.opacity = 0

    output.tooltipComponent = (
      <div className={opts.classes.join(' ')} style={styles.tooltip} data-target={step.selector}>
        {disableArrow || (
          <div
            className={`joyride-tooltip__triangle joyride-tooltip__triangle-${opts.positionClass}`}
            style={styles.arrow}
          />
        )}
        <a
          href="#"
          data-tooltip="Minimize tutorial step to Beacon" // Semantic-UI CSS magic: http://semantic-ui.com/modules/popup.html#tooltip
          data-position="bottom right" // Semantic-UI CSS magic
          data-variation="mini" // Semantic-UI CSS magic
          className={`joyride-tooltip__close${output.header ? ' joyride-tooltip__close--header' : ''}`}
          style={styles.buttons.close}
          data-type="close"
          onClick={onClick}
        >
          &nbsp;
        </a>
        {output.header}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {step.imageSrc && <img src={step.imageSrc} style={{ height: '100%' }} />}
          {output.main}
          {step.imageRightSrc && <img src={step.imageRightSrc} style={{ height: '100%' }} />}
        </div>
        <div className="joyride-tooltip__footer">
          {output.skip}
          {output.secondary}
          {buttons.primary && (
            <a
              href="#"
              className="joyride-tooltip__button joyride-tooltip__button--primary"
              style={styles.buttons.primary}
              data-type={['single', 'casual'].indexOf(type) > -1 ? 'close' : 'next'}
              onClick={onClick}
            >
              {buttons.primary}
            </a>
          )}
        </div>
      </div>
    )

    if (!showOverlay) return output.tooltipComponent

    output.hole =
      step.selector === 'body' ? null : <div className={`joyride-hole ${browser}`} style={styles.hole} />

    return (
      <div style={{ pointerEvents: 'none' }}>
        <div
          className="joyride-overlay"
          style={{
            cursor: disableOverlay ? 'default' : 'pointer',
            height: document.body.clientHeight,
            pointerEvents: 'none',
          }}
          data-type="close"
          onClick={!disableOverlay ? onClick : undefined}
        >
          {output.hole}
          {output.tooltipComponent}
        </div>
      </div>
    )
  }
}
