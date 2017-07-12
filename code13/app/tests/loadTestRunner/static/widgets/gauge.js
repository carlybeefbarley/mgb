{
  window.ml.Gauge = class Gauge {
    constructor(color1 = 'red', color2 = 'yellow', className = '') {
      this.widget = document.createElement('div')
      this.widget.classList.add('gauge')
      if (className) {
        this.widget.classList.add(className)
      }

      this.right = this.widget.appendChild(document.createElement('div'))
      this.right.classList.add('right')

      this.mask = this.widget.appendChild(document.createElement('div'))
      this.mask.classList.add('mask')

      this.left = this.widget.appendChild(document.createElement('div'))
      this.left.classList.add('left')

      this.center = this.widget.appendChild(document.createElement('div'))
      this.center.classList.add('center')

      this.shading = this.widget.appendChild(document.createElement('div'))
      this.shading.classList.add('shading')

      this.text = this.center.appendChild(document.createElement('span'))

      this.widget.style.backgroundColor = color2

      this.left.style.backgroundColor = color1
      this.right.style.backgroundColor = color1
      this.mask.style.backgroundColor = 'inherit'

      this.progress(0)
    }

    show(parent) {
      parent.appendChild(this.widget)
    }

    progress(proc) {
      proc = Math.max(0, Math.min(100, proc))
      this.text.innerHTML = proc.toFixed(2) + '%'
      const val = proc * 360 / 100
      if (proc <= 50) {
        this.left.style.opacity = 0
        this.right.style.transform = `rotate(${val}deg)`
        this.left.style.transform = `rotate(180deg)`
      } else {
        this.left.style.opacity = 1
        this.right.style.transform = `rotate(180deg)`
        this.left.style.transform = `rotate(${val}deg)`
      }
    }
  }
}
