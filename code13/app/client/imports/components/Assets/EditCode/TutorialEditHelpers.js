import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Header, Button, Segment, Message, Icon, List, Label, Dropdown } from 'semantic-ui-react'
import { parseStepsWithMacroResults } from '/client/imports/Joyride/Joyride'

import { stepKeyOptionsForDropdown, autocompleteOptions } from '/client/imports/Joyride/JoyrideSpecialMacros'

const isMacroStepSty = { color: 'green' }
const errorSty = { color: 'red' }
const hasTodoSty = { color: 'blue' }

const StepSummary = ({ rawStep, parsedStep, stepErrors }) => {
  return (
    <List.Item>
      {_.isString(rawStep) && <span style={isMacroStepSty}>[{rawStep}]&nbsp;</span>}
      {_.has(parsedStep, 'TODO') && (
        <small style={hasTodoSty}>
          [TODO: {parsedStep.TODO}] <br />
        </small>
      )}
      {rawStep.title ||
        parsedStep.title ||
        (_.isString(parsedStep) ? (
          <span style={errorSty}>Unknown Macro</span>
        ) : (
          '(Missing title: field in step)'
        ))}
      {stepErrors && stepErrors.length > 0 ? (
        <List.List>
          {_.map(stepErrors, (e, idx) => (
            <List.Item key={idx} style={errorSty}>
              Error: "{e.key}" : {e.val}
            </List.Item>
          ))}
        </List.List>
      ) : (
        <br />
      )}
    </List.Item>
  )
}

// This could be state, but I don't need it to be reactive yet, and I like the idea of the most
// recent value persisting page changes, so keeping the value static so it survives page navs for now.
// I might reconsider the UI wisdom of this in future :)
let _recentSelectedStepMacroKey = '%complete%'

const StepHelp = ({ insertCodeCallback }) => (
  <div style={{ marginTop: '2em' }}>
    <Header as="h3">
      Step macro lookup:
      {insertCodeCallback && (
        <Label
          content="insert"
          onClick={() => insertCodeCallback(`"${_recentSelectedStepMacroKey}"`)}
          style={{ float: 'right' }}
          icon="chevron circle left"
        />
      )}
    </Header>
    <Dropdown
      fluid
      search
      selection
      options={stepKeyOptionsForDropdown}
      placeholder="Step Tag Lookup"
      onChange={(event, data) => {
        _recentSelectedStepMacroKey = data.value
      }}
    />
  </div>
)

const TutSummary = props => {
  const pj = props.parsedTutorialData

  if (!pj) return null

  if (pj.errorHintString)
    return <Message error icon="warning sign" header="JSON Parse error:" content={pj.errorHintString} />

  if (!pj.data)
    return (
      <Message
        info
        header="Empty Tutorial"
        content="If you delete all content you can choose a starter template"
      />
    )

  if (!_.isArray(pj.data.steps))
    return (
      <Message
        warning
        header="No &quot;steps:&quot; array defined"
        content="You must define a steps [] array for the tutorial"
      />
    )

  if (pj.data.steps.length === 0)
    return (
      <Message
        warning
        header="No &quot;steps:&quot; array content"
        content="The &quot;steps:&quot; array must have at least one step"
      />
    )

  const steps2 = parseStepsWithMacroResults(pj.data.steps)

  return (
    <Segment basic>
      {/* Parsed ok */}
      <Message
        success
        compact
        icon="checkmark box"
        header="JSON Parses OK"
        content={`Tutorial has ${pj.data.steps.length} steps`}
      />

      {/* List Tutorial Steps */}
      <Header as="h4">Tutorial steps:</Header>
      <List ordered>
        {_.map(pj.data.steps, (s, idx) => (
          <StepSummary
            key={idx}
            rawStep={s}
            parsedStep={steps2.newSteps[idx]}
            stepErrors={steps2.errors[idx]}
          />
        ))}
      </List>
    </Segment>
  )
}

const TutorialMentor = ({ tryTutorial, stopTutorial, parsedTutorialData, insertCodeCallback }) => {
  const pj = parsedTutorialData
  const isBadData =
    !pj || pj.errorHintString || !pj.data || !_.isArray(pj.data.steps) || pj.data.steps.length === 0
  return (
    <div>
      <Button size="small" color="yellow" disabled={isBadData} onClick={tryTutorial}>
        <Icon name="student" />Try Tutorial
      </Button>
      <Button size="small" color="yellow" onClick={stopTutorial}>
        <Icon name="stop" />Stop Tutorial
      </Button>
      <br />
      <StepHelp insertCodeCallback={insertCodeCallback} />
      <TutSummary parsedTutorialData={parsedTutorialData} />

      {/* Sadly, this is needed to provide space for StepList Dropdown. I can't find a way to auto-size the outer segment without causing other issues yet */}
      <div style={{ minHeight: '10em' }} />
    </div>
  )
}

TutorialMentor.propTypes = {
  insertCodeCallback: PropTypes.func, // (optional). If provided then allow code to be inserted. Takes one parameter, the string of text to be inserted
  parsedTutorialData: PropTypes.object, // null for not valid, or an object set by TutorialMentor.parseJson
  tryTutorial: PropTypes.func, // Bound to context it can work in.. usually EditCode
  stopTutorial: PropTypes.func, // Bound to context it can work in.. usually EditCode
}

// parseJson()
// Takes JSON string as parameter, returns JSON.parse result and also some extra error info
// [Refactor: This is not tutorial-specific, it's a general-purpose JSON helper so could be moved elsewhere]
// This function always returns an obkect with the following shape:
// {
//   data:             null for cloud not parse, else, the javascript object returned by JSON.parse
//   errorHintString:  null if no error, or human-readable string
//   errorCharIdx:     -1 if not valid, or >=0 if this is a character position we think that stopped the parse
// }
// .. it never returns null/undefined
TutorialMentor.parseJson = json => {
  let data = null
  let errorHintString = null
  let errorCharIdx = -1

  try {
    data = JSON.parse(json)
  } catch (err) {
    errorHintString = err.toString()
  }

  if (errorHintString) {
    const extractedNum = errorHintString.replace(/\D/g, '')
    if (extractedNum && extractedNum.length > 0) errorCharIdx = parseInt(extractedNum, 10)
  }

  return { data, errorHintString, errorCharIdx }
}

TutorialMentor.showHint = (cm, CodeMirror) => {
  /* text: description: value */
  let tooltip = null
  // TODO: optimize - reuse tooltip
  const createTooltip = () => {
    const node = document.createElement('div')
    // same class as for JS tooltips
    node.className = 'CodeMirror-Tern-tooltip CodeMirror-Tern-hint-doc'
    return node
  }
  const removeTooltip = () => {
    if (tooltip) {
      tooltip.parentNode.removeChild(tooltip)
    }
  }

  return cm.showHint({
    hint() {
      const token = cm.getTokenAt(cm.getCursor())
      if (token.type != 'string') {
        return null
      }
      // strip quotes
      const keyword = token.string.substring(1, token.string.length - 1)
      const list = autocompleteOptions.filter(a => {
        return !keyword || a.text.startsWith(keyword)
      })
      const from = Object.assign({}, cm.getCursor())
      from.ch = token.start + 1 // keep quote

      const to = Object.assign({}, from)
      to.ch = token.end - 1 // keep quote

      list.sort((a, b) => {
        return a.text < b.text ? -1 : 1
      })
      const hints = {
        list,
        from,
        to,
        // completeSingle seems that is not working ?
        completeSingle: false,
      }

      CodeMirror.on(hints, 'select', (completion, element) => {
        // remove old tooltip
        removeTooltip()

        tooltip = createTooltip()
        tooltip.innerHTML = completion.desc
        // li < ul < body - by default
        element.parentNode.parentNode.appendChild(tooltip)
        const box = element.getBoundingClientRect()
        const ulbox = element.parentNode.getBoundingClientRect()

        tooltip.style.left = ulbox.left + ulbox.width + 'px'
        tooltip.style.top = box.top + 'px'
      })
      CodeMirror.on(hints, 'close', () => {
        removeTooltip()
        // cleanup
        CodeMirror.off(hints, 'close')
        CodeMirror.off(hints, 'select')
      })
      return hints
    },
  })
}
export default TutorialMentor
