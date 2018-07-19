import ReactTestUtils from 'react-dom/test-utils'
const DRAG_THRESHOLD = 10
const dragAndDropSimulator = {
  simulateDragAndDrop(src, target) {
    const initalEventData = {
      dataTransfer: {
        data: {},
        setData(type, data) {
          this.data[type] = data
        },
        getData(type) {
          return this.data[type]
        },
      },
    }

    const srcElement = typeof src === 'string' ? document.querySelector(src) : src
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target

    if (!srcElement) throw new Error('Cannot locate source')

    if (!targetElement) throw new Error('Cannot locate target')

    // srcElement.style.border = "solid 5px red"
    // targetElement.style.border = "solid 5px blue"

    ReactTestUtils.Simulate.dragStart(srcElement, initalEventData)
    ReactTestUtils.Simulate.drop(targetElement, initalEventData)
    ReactTestUtils.Simulate.dragEnd(srcElement, initalEventData)
  },

  // bind this event to touchstart DOM event
  startDragOnTouch(e) {
    let sx = 0,
      sy = 0
    if (e.touches.length) {
      sx = e.touches[0].clientX
      sy = e.touches[0].clientY
    }
    const initialMove = e => {
      let tx = 0,
        ty = 0
      if (e.touches.length) {
        tx = e.touches[0].clientX
        ty = e.touches[0].clientY
      }

      // ignore drag for some px threshold
      if (Math.abs(sx - tx) < DRAG_THRESHOLD && Math.abs(sy - ty) < DRAG_THRESHOLD) {
        e.preventDefault()
        return
      }

      e.target.removeEventListener('touchmove', initialMove)

      const initalEventData = {
        dataTransfer: {
          data: {},
          setData(type, data) {
            this.data[type] = data
          },
          getData(type) {
            return this.data[type]
          },
        },
      }

      ReactTestUtils.Simulate.dragStart(e.target, initalEventData)

      const clone = e.target.cloneNode(true)
      document.body.appendChild(clone)
      clone.style.position = 'absolute'
      //clone.style.border = "solid 1px red"
      clone.style.pointerEvents = 'none'
      clone.style.opacity = '0.8'

      const changedTouch = e.changedTouches[0]
      const box = e.target.getBoundingClientRect()
      const offx = box.left - changedTouch.clientX
      const offy = box.top - changedTouch.clientY

      clone.style.left = changedTouch.clientX + offx + 'px'
      clone.style.top = changedTouch.clientY + offy + 'px'

      if (clone.tagName == 'CANVAS') {
        const ctx = clone.getContext('2d')
        ctx.drawImage(e.target, 0, 0)
      }

      const touchMove = e => {
        const changedTouch = e.changedTouches[0]
        clone.style.left = changedTouch.clientX + offx + 'px'
        clone.style.top = changedTouch.clientY + offy + 'px'
      }

      window.addEventListener('touchmove', touchMove)

      const touchEnd = e => {
        e.stopPropagation()
        e.target.removeEventListener('touchend', touchEnd)
        window.removeEventListener('touchmove', touchMove)
        document.body.removeChild(clone)

        const changedTouch = e.changedTouches[0]
        const target = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY)

        // this only works with React - DOM events won't pick up react drop event
        // as workaround - wrap target into <div className="accept-drop" onDrop={() => dropHandler }>
        // this will allow to catch React drop event
        ReactTestUtils.Simulate.drop(target, initalEventData)
        ReactTestUtils.Simulate.dragEnd(e.target, initalEventData)
      }
      e.target.addEventListener('touchend', touchEnd)

      // this will fail on react - onTouchStart - synthetic event
      e.preventDefault()
      e.stopPropagation()
    }
    e.preventDefault()
    e.target.addEventListener('touchmove', initialMove)
    const cleanUp = () => {
      e.target.removeEventListener('touchmove', initialMove)
    }
    e.target.addEventListener('touchend', cleanUp)
  },
}

export default dragAndDropSimulator
