import React from 'react';

export default class Properties extends React.Component {

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }
  get map(){
    return this.props.info.content.map;
  }

  handleClick(layerNum){

  }
  render() {
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon"></i>
              {this.props.info.title}
            </span>
          </div>
          <div className="active content menu">
            <div>Hello World!</div>
          </div>
        </div>
      </div>
    )
  }
}
