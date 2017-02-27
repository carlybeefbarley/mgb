class Test {
  constructor(data, parent){
    this.widget = document.createElement("div")
    this.widget.classList.add("test")
    this.widget.setAttribute("title", JSON.stringify(data))

    this.title = this.widget.appendChild(document.createElement("span"))
    this.title.innerHTML = data.title

    this.duration = this.widget.appendChild(document.createElement("span"))
    this.duration.innerHTML = data.duration

    this.state = this.widget.appendChild(document.createElement("span"))
    this.state.innerHTML = data.state

    parent.appendChild(this.widget)
  }
}

class TestCase {
  constructor(data, restart){
    this.data = data
    this._restart = restart
    TestCase.cases.push(this)


    this.widget = document.createElement("div")
    this.widget.classList.add("testCase")

    this.title = this.widget.appendChild(document.createElement("span"))
    this.title.innerHTML = data.name

    this.status = this.widget.appendChild(document.createElement("span"))
    this.status.innerHTML = "running..."

    this.actions = document.createElement("span")
    this.actions.classList.add("actions")
    this.createActions()

    document.body.appendChild(this.widget)
  }

  update(data){
    this.widget.removeChild(this.status)
    this.widget.appendChild(this.actions)
    data.tests.forEach( t => {
      new Test(t, this.widget)
    })
  }

  createActions(){
    this.restartBtn = this.actions.appendChild(document.createElement('a'))
    this.restartBtn.innerHTML = 'Restart'
    this.restartBtn.classList.add("restart")
    this.restartBtn.onclick = () => {
      this._restart()
    }

    this.removeBtn = this.actions.appendChild(document.createElement('a'))
    this.removeBtn.innerHTML = 'Remove'
    this.removeBtn.classList.add("remove")
    this.removeBtn.onclick = () => {
      this.destroy()
    }


  }

  destroy(){
    this.widget.parentElement.removeChild(this.widget)
    const index = TestCase.cases.findIndex(t => {
      return t === this
    })
    if(index > -1)
      TestCase.cases.slice(index, 1)
  }
}
TestCase.cases = []
TestCase.find = (id) => TestCase.cases.find((t) => {
    if(t.data.id === id){
      return t
    }
  })

