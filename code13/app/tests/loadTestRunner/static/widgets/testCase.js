require(['https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.bundle.min.js'], () => {
  const TestCase = (window.ml.TestCase = class {
    constructor(data, restart) {
      TestCase.cases.push(this)

      this.data = data
      this.tests = []
      this.runners = 0
      this.needRestart = false
      this.expanded = false
      this.errors = 0

      this._restart = restart

      this.widget = document.createElement('div')
      this.widget.classList.add('testCase')

      this.title = this.widget.appendChild(document.createElement('span'))
      this.title.classList.add('title')
      this.title.onclick = () => this.toggleExpand()
      this.title.setAttribute('label', '+')

      this.title.innerHTML = data.title ? `${data.title} (${data.name})` : data.name

      this.status = document.createElement('span')
      this.status.classList.add('status')

      this.autoRestart = this.widget.appendChild(document.createElement('input'))

      this.autoRestart.setAttribute('type', 'checkbox')
      this.autoRestart.setAttribute('label', 'auto restart?')
      this.autoRestart.onclick = val => {
        this.needRestart = !this.needRestart
      }

      this.errorsLabel = this.widget.appendChild(document.createElement('span'))

      this.actions = document.createElement('span')
      this.actions.classList.add('actions')

      this.createActions()
      this.widget.insertBefore(this.actions, this.title.nextSibling)

      this.chartWrapper = this.widget.appendChild(document.createElement('div'))
      this.chartWrapper.classList.add('chart-wrapper')

      this.canvas = this.chartWrapper.appendChild(document.createElement('canvas'))
      this.canvas.height = 200

      this.chartData = { labels: [], datasets: [] }

      this.chart = new window.Chart(this.canvas, {
        type: 'line', // 'bar'
        fill: false,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
        data: this.chartData,
      })

      document.body.appendChild(this.widget)
    }

    init(data) {
      // this.title.innerHTML = data.name
      this.status.innerHTML = 'Running ' + this.runners

      // this.actions.parentNode && this.widget.removeChild(this.actions)
      this.widget.insertBefore(this.status, this.chartWrapper)
    }

    update(data) {
      this.runners--
      if (this.runners < 0) {
        this.runners = 0
      }

      this.status.innerHTML = 'Running ' + this.runners
      if (this.runners == 0) {
        this.status.parentNode && this.widget.removeChild(this.status)
      }
      if (!data || !data.tests) {
        return
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
       borderColor: 'rgba(255,192,192,1)',
       label: 'Test 01',
       data: [1, 2]
       },
       {
       borderWidth: 1,
       lineTension: 0.1,
       fill: false,
       borderColor: 'rgba(75,192,192,1)',
       label: 'Test 03',
       data: [7, 1]
       },
       {
       borderWidth: 1,
       lineTension: 0.1,
       fill: false,
       borderColor: 'rgba(75,20,255,1)',
       label: 'Test 02',
       data: [3, 9]
       }
       ]
       }*/

      const colors = [
        //'#ff0000',
        '#00ff00',
        '#0000ff',
        '#00ffff',
        '#ff00ff',
        '#ffff00',
      ]

      let hasErrors = false
      data.tests.forEach((t, i) => {
        if (t.state != 'passed') hasErrors = true
      })

      if (!hasErrors) {
        this.chartData.labels.push(this.chartData.labels.length + 1)
        data.tests.forEach((t, i) => {
          if (!this.chartData.datasets[i]) {
            this.chartData.datasets[i] = {
              borderWidth: 1,
              lineTension: 0.01,
              fill: false,
              borderColor: colors[i] || '#000000',
              label: t.title,
              data: [],
            }
          }
          const ds = this.chartData.datasets[i]
          if (t.state == 'passed') {
            ds.data.push(t.duration || 0)
          } else {
            hasErrors = true
            ds.data.push(null)
          }
        })
        this.expanded && this.chart.update()
      } else {
        this.errors++
        this.errorsLabel.innerHTML = 'Tests Failed:' + this.errors
      }
      this.needRestart && this.restart()
    }

    createActions() {
      this.restartBtn = this.actions.appendChild(document.createElement('a'))
      this.restartBtn.innerHTML = 'Add runner'
      this.restartBtn.classList.add('play')
      this.restartBtn.onclick = () => this.restart()

      this.removeBtn = this.actions.appendChild(document.createElement('a'))
      this.removeBtn.innerHTML = 'Clear'
      this.removeBtn.classList.add('clear')
      this.removeBtn.onclick = () => this.clear()

      /*this.removeBtn = this.actions.appendChild(document.createElement('a'))
      this.removeBtn.innerHTML = 'Remove'
      this.removeBtn.classList.add('remove')
      this.removeBtn.onclick = () => {
        alert('Not implemented')
        //this.destroy()
      }*/
    }

    toggleExpand(expand) {
      this.expanded = expand != void 0 ? expand : !this.expanded
      if (this.expanded) {
        this.chart.update()
        this.widget.classList.add('expanded')
        this.title.setAttribute('label', '-')
      } else {
        this.widget.classList.remove('expanded')
        this.title.setAttribute('label', '+')
      }
    }

    restart() {
      if (location.hash !== '#admin') {
        if (confirm('Only admin can add test runners.. do you wish to become the admin?')) {
          location.hash = 'admin'
          alert('Now you are the admin!')
        }
        return
      }
      this.runners++
      // this.toggleExpand(true)
      this.status.innerHTML = 'Running ' + this.runners
      this._restart(this.data)
    }

    destroy() {
      this.widget.parentElement.removeChild(this.widget)
      const index = TestCase.cases.findIndex(t => {
        return t === this
      })
      if (index > -1) TestCase.cases.slice(index, 1)
    }

    clear() {
      this.chartData.labels.length = 0
      this.chartData.datasets.length = 0
      this.expanded && this.chart.update()
      this.chart.update()
    }
  })

  TestCase.cases = []
  TestCase.find = id =>
    TestCase.cases.find(t => {
      if (t.data.id === id) {
        return t
      }
    })
})
