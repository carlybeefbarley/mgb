{
  window.ml.Info = class {
    constructor() {
      this.widget = document.createElement('div')
      this.widget.classList.add('info')
      this.table = this.widget.appendChild(document.createElement('table'))
      this.data = {}
      this.rows = {}
    }
    show(parent) {
      parent.appendChild(this.widget)
    }
    addOrUpdate(key, val, cb) {
      this.data[key] = { val, cb }
      this.update()
    }
    update() {
      for (let i in this.data) {
        if (!this.rows[i]) {
          const tr = this.table.appendChild(document.createElement('tr'))
          const key = tr.appendChild(document.createElement('td'))
          const val = tr.appendChild(document.createElement('td'))
          this.rows[i] = { tr, key, val }
        }
        this.rows[i].key.innerHTML = i
        this.rows[i].key.style.minWidth = '150px'
        this.rows[i].val.style.minWidth = '150px'

        if (this.data[i].cb) {
          this.rows[i].key.style.color = 'blue'
          this.rows[i].key.style.cursor = 'pointer'
          this.rows[i].key.onclick = () => {
            this.data[i].cb()
          }
        } else {
          this.rows[i].key.style.color = ''
          this.rows[i].key.style.cursor = ''
          this.rows[i].key.onclick = null
        }
        this.rows[i].val.innerHTML = this.data[i].val
      }
    }
    remove(key) {
      delete this.data[key]
      if (this.rows[key]) {
        const r = this.rows[key]
        r.tr.parentNode.removeChild(r.tr)
        delete this.rows[key]
      }
    }
  }
}
