import React, { PropTypes } from 'react'
import { Message } from 'semantic-ui-react'

const TutorialMentor = ( { tryTutorial, stopTutorial, parsedTutorialData } ) => (
  <div>
    <button className='ui small yellow button' onClick={tryTutorial}>
      <i className='student icon' />Try Tutorial
    </button>
    <button className='ui small yellow button' onClick={stopTutorial}>
      <i className='stop icon' />Stop Tutorial
    </button>
    <br />
    { parsedTutorialData.data && 
      <Message success content='JSON Parses OK' /> 
    }
    { parsedTutorialData.errorHintString && 
      <Message warning content={`JSON Parse error: ${parsedTutorialData.errorHintString}`} />
    }
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