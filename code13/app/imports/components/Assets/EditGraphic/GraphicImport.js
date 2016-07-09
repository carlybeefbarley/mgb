import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class GraphicImport extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {

	    };
	}

	onDrop(event){
		event.stopPropagation()
    	event.preventDefault()

		console.log(event, event.dataTransfer.files);
	}

	onDragOver(event){
		event.stopPropagation();
    	event.preventDefault();
    	event.dataTransfer.dropEffect = 'copy';

		// console.log('on drag over', event);
	}

	render(){
		return (
			<div className="ui modal">
	          <div class="header">Header</div>
	          <div
	          	onDragOver={this.onDragOver.bind(this)}
	          	onDrop={this.onDrop.bind(this)}
	          	>
		          	Drop image here! <br/>
		          	Hello
	          </div>
	          <div class="content">
	            <p></p>
	            <p></p>
	            <p></p>
	          </div>
	        </div>
		);
	}
}