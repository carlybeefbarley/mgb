import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import sty from  './graphicImport.css';

export default class GraphicImport extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {
	    	status: "empty" // empty, draggedOver, uploading, uploaded
	    	, tileWidth: 64
	    	, tileHeight: 64
	    };
	}

	componentDidMount(){
		this.canvas = ReactDOM.findDOMNode(this.refs.uploadCanvas);
		this.ctx = this.canvas.getContext('2d');
	}

	onDragOver(event){
		event.stopPropagation();
    	event.preventDefault();
    	event.dataTransfer.dropEffect = 'copy';
    	this.setState({ status: "draggedOver" });
	}

	onDragLeave(event){
		this.setState({ status: "empty" });
	}

	onDrop(event){
		event.stopPropagation()
    	event.preventDefault()

    	let self = this;
    	let files = event.dataTransfer.files;
    	if (files.length > 0){
	      var reader = new FileReader()
	      reader.onload = (ev) => {
	        let theUrl = ev.target.result
	        
	        let tmpImg = new Image();
	        tmpImg.onload = function(e){ // image is uploaded to browser
	        	self.setState({ status: "uploaded" });
	        	self.drawImage(tmpImg);
	        }
	        tmpImg.src = theUrl;	        
	      }
	      reader.readAsDataURL(files[0])
	    }
	}

	drawImage(img){
		this.canvas.width = img.width;
		this.canvas.height = img.height;
		this.ctx.drawImage(img, 0, 0);
	}


	changeTileWidth(event){
		this.setState({ tileWidth: event.target.value});
	}

	changeTileHeight(event){
		this.setState({ tileHeight: event.target.value});
	}

	finishImport(){

	}

	clearAll(){
		this.setState({ status: "empty" });
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	

	render(){
		return (
			<div className="ui modal">	          
	          <div className="content">

	          	{/*** upload form ***/}
	          	<div className={"uploadForm " + (this.state.status === "uploaded" ? "hidden " : " ") + (this.state.status === "draggedOver" ? "draggedOver" : "")}
	          		onDragOver={this.onDragOver.bind(this)}
	          		onDragLeave={this.onDragLeave.bind(this)}
	          		onDrop={this.onDrop.bind(this)}>
	          			<br/><br/><br/><br/><br/>
	          			<h2>Drop image here!</h2>
	          			<br/><br/><br/><br/><br/>
	          	</div>

	          	{/*** uploaded image ***/}
	          	<div className={this.state.status === "uploaded" ? "" : "hidden"}>
	          		<div className="row">

			          	<div className="ui small labeled input">
						  <div className="ui small label" title="Tile width">
						    width
						  </div>
						  <input className="ui small input" type="number" min="1" max="999" value={this.state.tileWidth} onChange={this.changeTileWidth.bind(this)} />
						</div>

						<div className="ui small labeled input">
						  <div className="ui small label" title="Tile height">
						    height
						  </div>
						  <input className="ui small input" type="number" min="1" max="999" value={this.state.tileHeight} onChange={this.changeTileHeight.bind(this)} />
						</div>

						<div onClick={this.finishImport.bind(this)} className="ui small icon button">
							<i className="icon small save"></i>Finish import
						</div>

						<div onClick={this.clearAll.bind(this)} className="ui small icon button">
							<i className="icon small remove circle"></i>Clear All
						</div>

			          </div>

	            	<canvas ref="uploadCanvas" ></canvas>

	            </div>
	          </div>
	        </div>
		);
	}
}