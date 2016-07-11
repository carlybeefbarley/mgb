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
	    	, imgWidth: null
	    	, imgHeight: null
	    };
	}

	componentDidMount(){
		this.canvas = ReactDOM.findDOMNode(this.refs.uploadCanvas);
		this.ctx = this.canvas.getContext('2d');
	}

	componentDidUpdate(prevProps, prevState){
		if(this.state.status === "uploaded" && this.loadedImg){
			this.drawImage();
			this.drawGrid();
		}
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
	        	self.onImageLoaded(tmpImg);
	        }
	        tmpImg.src = theUrl;	        
	      }
	      reader.readAsDataURL(files[0])
	    }
	}

	onImageLoaded(img){
		this.loadedImg = img;
		this.setState({ imgWidth: img.width, imgHeight: img.height});
		this.canvas.width = img.width;
		this.canvas.height = img.height;

		this.drawImage();
		this.drawGrid();
	}

	drawImage(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(this.loadedImg, 0, 0);
	}

	drawGrid(){
		let self = this;
		this.ctx.lineWidth = 1;
    	this.ctx.strokeStyle = '#000000';

    	let cols = Math.ceil(this.canvas.width / this.state.tileWidth);
		for(let col=0; col<cols; col++){
			let x = (col+1)*this.state.tileWidth - 0.5;
			drawLine(x, -0.5, x, this.canvas.height+0.5);
		}

		let rows = Math.ceil(this.canvas.height / this.state.tileHeight);
		for(let row=0; row<rows; row++){
			let y = (row+1)*this.state.tileHeight - 0.5;
			drawLine(-0.5, y, this.canvas.width+0.5, y);
		}

		function drawLine(x1, y1, x2, y2){
	      self.ctx.beginPath();
	      self.ctx.moveTo(x1, y1);
	      self.ctx.lineTo(x2, y2);
	      self.ctx.stroke();
	    }
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
		this.loadedImg = null;
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

			        <div className="ui divider"></div>
			        <div   style={{ "overflow": "auto", "maxHeight": "600px"}}>
	            		<canvas ref="uploadCanvas" ></canvas>
	            	</div>

	            </div>
	          </div>
	        </div>
		);
	}
}