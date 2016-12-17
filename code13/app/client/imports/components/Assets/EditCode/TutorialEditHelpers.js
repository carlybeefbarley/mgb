import _ from 'lodash' 
import React, { PropTypes } from 'react'
import { Segment, Message } from 'semantic-ui-react'
import { parseStepsWithMacroResults } from '/client/imports/Joyride/Joyride'

const blueSty = { color: 'blue' }
const redSty =  { color: 'red' }

const StepSummary = ( { rawStep, parsedStep, stepErrors } ) => 
{
  // <li key={idx}>{s.title || '(Missing title: field in step)'}</li>
  return (
    <li >
      { _.isString(rawStep) && <span style={blueSty}>{rawStep} </span>}
      {rawStep.title || parsedStep.title || (_.isString(parsedStep) ? <span style={redSty}>Unknown Macro</span> : '(Missing title: field in step)')}
      { (stepErrors && stepErrors.length > 0) ?
        <ul>
          { _.map(stepErrors, (e, idx) => <pre key={idx} style={redSty}>{e.key} : {e.val}</pre> ) }
        </ul>
        :
        <br />
      }
    </li>
  )
}

const TutSummary = props => {
  const pj = props.parsedTutorialData

  if (pj.errorHintString)
    return <Message warning content={`JSON Parse error: ${pj.errorHintString}`} />

  if (!pj.data)
    return <Message info content='Empty Tutorial'/>

  if (!_.isArray(pj.data.steps))
    return <Message warning content='No steps: [] array defined'/>

  if (pj.data.steps.length === 0)
    return <Message warning content='steps: [] array must have at least one step'/>

  const steps2 = parseStepsWithMacroResults(pj.data.steps)

  return (
    <Segment basic>
      <Message success content='JSON Parses OK' /> 
      Tutorial has { pj.data.steps.length } steps:
      <ol>
      { _.map(pj.data.steps, (s,idx) => <StepSummary key={idx} rawStep={s} parsedStep={steps2.newSteps[idx]} stepErrors={steps2.errors[idx]} />) }
      </ol>
    </Segment>
  )
}


const TutorialMentor = ( { tryTutorial, stopTutorial, parsedTutorialData } ) => (
  <div>
    <button className='ui small yellow button' onClick={tryTutorial}>
      <i className='student icon' />Try Tutorial
    </button>
    <button className='ui small yellow button' onClick={stopTutorial}>
      <i className='stop icon' />Stop Tutorial
    </button>
    <br />
    <TutSummary parsedTutorialData={parsedTutorialData} />
  </div>
)

TutorialMentor.propTypes = {
  parsedTutorialData: PropTypes.object,   // null for not valid, or an object set by TutorialMentor.parseJson
  tryTutorial:  PropTypes.func,           // Bound to context it can work in.. usually EditCode
  stopTutorial: PropTypes.func            // Bound to context it can work in.. usually EditCode
}

// Takes JSON as parameter returns
// { 
//   data:             null for cloud not parse, else, the javascript object returned by JSON.parse
//   errorHintString:  null if no error, or human-readable string
//   errorCharIdx:     -1 if not valid, or >=0 if this is a character position we think that stopped the parse
// }
TutorialMentor.parseJson = ( json ) =>
{
  let data = null
  let errorHintString = null
  let errorCharIdx = -1

  try {
    data = JSON.parse(json)
  }
  catch (err) {
    errorHintString = err.toString()
  }

  if (errorHintString)
  {
    const extractedNum = errorHintString.replace(/\D/g, '')
    if (extractedNum && extractedNum.length > 0)
      errorCharIdx = parseInt(extractedNum, 10)
  }

  return { data, errorHintString, errorCharIdx }  
}



export default TutorialMentor