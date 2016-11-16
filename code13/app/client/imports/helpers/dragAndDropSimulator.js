import ReactTestUtils from 'react-addons-test-utils'
export default {
  // bind this event to touchstart DOM event
  startDragOnTouch: (e) => {

    const initialMove = () => {
      e.target.removeEventListener("touchmove", initialMove)

      const initalEventData = {
        dataTransfer: {
          data: {},
          setData: function (type, data) {
            this.data[type] = data
          },
          getData: function (type) {
            return this.data[type]
          }
        }
      }

      ReactTestUtils.Simulate.dragStart(e.target, initalEventData)

      const clone = e.target.cloneNode(true)
      document.body.appendChild(clone)
      clone.style.position = "absolute"
      //clone.style.border = "solid 1px red"
      clone.style.pointerEvents = "none"
      clone.style.opacity = "0.8"

      const changedTouch = e.changedTouches[0]
      const box = e.target.getBoundingClientRect()
      const offx = box.left - changedTouch.clientX
      const offy = box.top - changedTouch.clientY

      clone.style.left = (changedTouch.clientX + offx) + "px"
      clone.style.top = (changedTouch.clientY + offy ) + "px"

      if (clone.tagName == "CANVAS") {
        const ctx = clone.getContext("2d")
        ctx.drawImage(e.target, 0, 0)
      }


      const touchMove = (e) => {
        const changedTouch = e.changedTouches[0]
        clone.style.left = (changedTouch.clientX + offx) + "px"
        clone.style.top = (changedTouch.clientY + offy ) + "px"
      }

      window.addEventListener("touchmove", touchMove)

      const touchEnd = (e) => {
        e.stopPropagation()
        e.target.removeEventListener("touchend", touchEnd)
        window.removeEventListener("touchmove", touchMove)
        document.body.removeChild(clone)

        const changedTouch = e.changedTouches[0]
        const target = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY)
        ReactTestUtils.Simulate.drop(target, initalEventData)
        ReactTestUtils.Simulate.dragEnd(e.target, initalEventData)
      }
      e.target.addEventListener("touchend", touchEnd)

      // this will fail on react - onTouchStart - synthetic event
      e.preventDefault()
      e.stopPropagation()
    }
    e.preventDefault()
    e.target.addEventListener("touchmove", initialMove)
    const cleanUp = () => {
      e.target.removeEventListener("touchmove", initialMove)
    }
    e.target.addEventListener("touchend", cleanUp)
  }
}
