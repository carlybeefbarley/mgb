{
  ml.Info = class {
    constructor(){
      this.widget = document.createElement("div")
      this.widget.classList.add('info')
      this.table = this.widget.appendChild(document.createElement('table'))
      this.data = {}
      this.rows = {}
    }
    show(parent){
      parent.appendChild(this.widget)
    }
    addOrUpdate(key, val){
      this.data[key] = val
      this.update()
    }
    update(){
      for(let i in this.data){
        if(!this.rows[i]){
          const tr = this.table.appendChild(document.createElement('tr'))
          const key = tr.appendChild(document.createElement('td'))
          const val = tr.appendChild(document.createElement('td'))
          this.rows[i] = {tr, key, val}
        }
        this.rows[i].key.innerHTML = i
        this.rows[i].val.innerHTML = this.data[i]
      }
    }
    remove(key){
      delete this.data[key]
      if(this.rows[key]){
        const r = this.rows[key]
        r.tr.parentNode.removeChild(r.tr)
        delete this.rows[key]
      }
    }
  }
}
