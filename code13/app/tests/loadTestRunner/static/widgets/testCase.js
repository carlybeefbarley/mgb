require(['https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.bundle.min.js'], () => {
  const TestCase = ml.TestCase = class {
    constructor(data, restart) {
      TestCase.cases.push(this)

      this.data = data
      this.tests = []
      this.runners = 0
      this.needRestart = false


      this._restart = restart


      this.widget = document.createElement("div")
      this.widget.classList.add("testCase")

      this.title = this.widget.appendChild(document.createElement("span"))
      this.title.innerHTML = data.title ? `${data.title} (${data.name})` : data.name

      this.status = this.widget.appendChild(document.createElement("span"))

      this.autoRestart = this.widget.appendChild(document.createElement("input"))

      this.autoRestart.setAttribute("type", "checkbox")
      this.autoRestart.setAttribute("label", "auto restart?")
      this.autoRestart.onclick = (val) => {
        this.needRestart = !this.needRestart
      }

      this.actions = document.createElement("span")
      this.actions.classList.add("actions")

      this.createActions()
      this.widget.insertBefore(this.actions, this.title.nextSibling)

      this.chartWrapper = this.widget.appendChild(document.createElement("div"))
      this.chartWrapper.style.height = "200px"
      this.chartWrapper.style.maxHeight = "200px"

      this.canvas = this.chartWrapper.appendChild(document.createElement("canvas"))
      this.canvas.height = 200

      this.chartData = {labels: [], datasets: []}

      this.chart = new Chart(this.canvas, {
        type: 'line',// 'bar'
        fill: false,
        options: {
          responsive: true,
          maintainAspectRatio: false
        },
        data: this.chartData
      })

      document.body.appendChild(this.widget)
    }

    init(data) {
      // this.title.innerHTML = data.name
      this.status.innerHTML = "Running " + this.runners

      // this.actions.parentNode && this.widget.removeChild(this.actions)
      this.widget.insertBefore(this.status, this.actions.nextSibling)
    }

    update(data) {
      this.runners--

      this.status.innerHTML = "Running " + this.runners
      if (this.runners == 0) {
        this.status.parentNode && this.widget.removeChild(this.status)
      }
      // this.widget.insertBefore(this.actions, this.title.nextSibling)
      /*data.tests.forEach( t => {
       this.tests.push(new Test(t, this.widget))
       })*/

      /*{
       labels: ['01', '02'],
       datasets: [
       {
       borderWidth: 1,
       lineTension: 0.1,
       fill: false,
       borderColor: "rgba(255,192,192,1)",
       label: 'Test 01',
       data: [1, 2]
       },
       {
       borderWidth: 1,
       lineTension: 0.1,
       fill: false,
       borderColor: "rgba(75,192,192,1)",
       label: 'Test 03',
       data: [7, 1]
       },
       {
       borderWidth: 1,
       lineTension: 0.1,
       fill: false,
       borderColor: "rgba(75,20,255,1)",
       label: 'Test 02',
       data: [3, 9]
       }
       ]
       }*/

      this.chartData.labels.push(this.chartData.labels.length + 1)

      const colors = [
        //"#ff0000",
        "#00ff00",
        "#0000ff",
        "#00ffff",
        "#ff00ff",
        "#ffff00"
      ]

      data.tests.forEach((t, i) => {
        if (!this.chartData.datasets[i]) {
          this.chartData.datasets[i] = {
            borderWidth: 1,
            lineTension: 0.01,
            fill: false,
            borderColor: colors[i] || '#000000',
            label: t.title,
            data: []
          }
        }
        const ds = this.chartData.datasets[i]
        if (t.state == 'passed') {
          ds.data.push(t.duration || 0)
        }
        else {
          ds.data.push(null)
        }
      })
      data.tests.forEach((t, i) => {
        const idx = data.tests + i
        if (t.state !== 'passed') {
          if (!this.chartData.datasets[idx]) {
            this.chartData.datasets[idx] = {
              borderWidth: 1,
              lineTension: 0.01,
              fill: false,
              borderColor: colors[idx] || '#000000',
              label: "Failed: " + t.title,
              data: []
            }
          }

          const ds = this.chartData.datasets[idx]
          ds.data[idx] = t.duration || 0
        }
      })
      this.chart.update()

      this.needRestart && this.restart()
    }

    createActions() {
      this.restartBtn = this.actions.appendChild(document.createElement('a'))
      this.restartBtn.innerHTML = 'Add runner'
      this.restartBtn.classList.add("play")
      this.restartBtn.onclick = () => this.restart()

      this.removeBtn = this.actions.appendChild(document.createElement('a'))
      this.removeBtn.innerHTML = 'Clear'
      this.removeBtn.classList.add("clear")
      this.removeBtn.onclick = () => this.clear()

      this.removeBtn = this.actions.appendChild(document.createElement('a'))
      this.removeBtn.innerHTML = 'Remove'
      this.removeBtn.classList.add("remove")
      this.removeBtn.onclick = () => {
        alert("Not implemented")
        //this.destroy()
      }
    }

    restart() {
      this.runners++
      this.status.innerHTML = "Running " + this.runners
      this._restart(this.data)
    }

    destroy() {
      this.widget.parentElement.removeChild(this.widget)
      const index = TestCase.cases.findIndex(t => {
        return t === this
      })
      if (index > -1)
        TestCase.cases.slice(index, 1)
    }

    clear() {
      this.chartData.labels.length = 0
      this.chartData.datasets.length = 0
      this.chart.update()
    }
  }

  TestCase.cases = []
  TestCase.find = (id) => TestCase.cases.find((t) => {
    if (t.data.id === id) {
      return t
    }
  })

})
