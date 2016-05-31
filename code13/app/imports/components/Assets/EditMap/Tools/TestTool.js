import React from 'react';
export default class TestTool extends React.Component {

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

  render() {
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
              <span className="explicittrigger">
                <i className="dropdown icon"></i>
                Test Tool
                </span>
          </div>
          <div className="active content">
            Here be inputs
          </div>
        </div>
      </div>
    )
  }
}
