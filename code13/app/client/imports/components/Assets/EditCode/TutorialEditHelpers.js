import _ from 'lodash' 
import React, { PropTypes } from 'react'
import { Header, Button, Segment, Message, Icon, List } from 'semantic-ui-react'
import { parseStepsWithMacroResults } from '/client/imports/Joyride/Joyride'

const isMacroStepSty = { color: 'green' }
const errorSty =       { color: 'red'   }
const hasTodoSty =     { color: 'blue'  }

const StepSummary = ( { rawStep, parsedStep, stepErrors } ) => 
{
  return (
    <List.Item >
      { _.isString(rawStep) && <span style={isMacroStepSty}>[{rawStep}]&nbsp;</span>}
      { _.has(parsedStep, 'TODO') && <small style={hasTodoSty}>[TODO: {parsedStep.TODO}] <br /></small> }
      { rawStep.title || parsedStep.title || (_.isString(parsedStep) ? <span style={errorSty}>Unknown Macro</span> : '(Missing title: field in step)')}
      { (stepErrors && stepErrors.length > 0) ?
        <List.List>
          { _.map(stepErrors, (e, idx) => <List.Item key={idx} style={errorSty}>Error: "{e.key}" : {e.val}</List.Item> ) }
        </List.List>
        :
        <br />
      }
    </List.Item>
  )
}

const TutSummary = props => {
  const pj = props.parsedTutorialData

  if (pj.errorHintString)
    return <Message error icon='warning sign' header='JSON Parse error:' content={pj.errorHintString} />

  if (!pj.data)
    return <Message info header='Empty Tutorial' content='If you delete all content you can choose a starter template'/>

  if (!_.isArray(pj.data.steps))
    return <Message warning header='No "steps:" array defined' content='You must define a steps [] array for the tutorial'/>

  if (pj.data.steps.length === 0)
    return <Message warning header='No "steps:" array content' content='The "steps:" array must have at least one step'/>

  const steps2 = parseStepsWithMacroResults(pj.data.steps)

  return (
    <Segment basic>
      <Message success compact icon='checkmark box' header='JSON Parses OK' content={`Tutorial has ${pj.data.steps.length} steps`}/> 
      <Header as='h4'>Tutorial steps:</Header>
      <List ordered>
        { _.map(pj.data.steps, (s,idx) => <StepSummary key={idx} rawStep={s} parsedStep={steps2.newSteps[idx]} stepErrors={steps2.errors[idx]} />) }
      </List>
    </Segment>
  )
}


const TutorialMentor = ( { tryTutorial, stopTutorial, parsedTutorialData } ) => { 
  const pj = parsedTutorialData
  const badData = (pj.errorHintString || !pj.data || !_.isArray(pj.data.steps) || pj.data.steps.length === 0)
  return (
    <div>
      <Button size='small' color='yellow' disabled={badData} onClick={tryTutorial}>
        <Icon name='student' />Try Tutorial
      </Button>
      <Button size='small' color='yellow' onClick={stopTutorial}>
        <Icon name='stop' />Stop Tutorial
      </Button>
      <br />
      <TutSummary parsedTutorialData={parsedTutorialData} />
    </div>
  )
}

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