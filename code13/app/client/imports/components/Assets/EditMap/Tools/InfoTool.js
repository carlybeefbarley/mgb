import _ from 'lodash';
import React from 'react';
export default class InfoTool extends React.Component {

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

  render() {
    let content = [];
    for(let i=0; i<this.props.info.content.length; i++){
      content.push(<div key={i}><i className="info icon"></i>{this.props.info.content[i]}</div>);
    }
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon"></i>
              {this.props.info.title}
            </span>
          </div>
          <div className="active content">
            {content}
          </div>
        </div>
      </div>
    )
  }
}
