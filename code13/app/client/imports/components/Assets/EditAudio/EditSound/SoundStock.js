import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class SoundStock extends React.Component {

	constructor(props) {
  	super(props);

  	this.state = {
  		searchField: "sound"
  		, sounds: []
  		, playingSoundID: null
  	}

  	this.searchOnSubmit() // to be deleted

  	// animframe for updating selecting rectangle animation
    this._raf = () => {
      if(this.state.playingSoundID) this.drawTimeline()
      window.requestAnimationFrame(this._raf);
    };
    this._raf();
	}

	searchOnChange(event){
		// TODO clever autosearch
		this.setState({ searchField: event.target.value })
	}

	searchOnSubmit(){
		let self = this
		const infolink = "/api/asset/sound/name/" + this.state.searchField;
    $.get(infolink, (sounds) => {
      self.setState({ sounds: sounds })
    })
	}

	togglePlay(soundID){
		let player = ReactDOM.findDOMNode(this.refs[soundID])
		if(this.state.playingSoundID === null){
			this.playSound(soundID)
		}
		else if(soundID === this.state.playingSoundID){
			player.pause()
			this.clearTimeline(soundID)
			this.setState({ playingSoundID: null })
		} 
		// if is played another sound already
		else {
			let player2 = ReactDOM.findDOMNode(this.refs[this.state.playingSoundID])
			player2.pause()
			player2.currentTime = 0
			this.clearTimeline(this.state.playingSoundID)
			this.playSound(soundID)
		}
	}

	playSound(soundID){
		let player = ReactDOM.findDOMNode(this.refs[soundID])
		if(player.src){
			player.play()
			this.setState({ playingSoundID: soundID })
		}
		else {
		  let self = this
		  const infolink = "/api/asset/sound/" + soundID;
      $.get(infolink, (data) => {
        player.src = data.dataUri
        player.play()
        self.setState({ playingSoundID: soundID })
      })
    }
	}

	drawTimeline(){
		let player = ReactDOM.findDOMNode(this.refs[this.state.playingSoundID])
		let timeLine = ReactDOM.findDOMNode(this.refs["timeline_"+this.state.playingSoundID])
		let ctx = timeLine.getContext('2d')
		let width = 280 * player.currentTime/player.duration
		// timeLine.width = width
		ctx.fillStyle="#c3c3c3"
		ctx.fillRect(0, 0, width, 128)
		// console.log(width)
		return width
	}

	clearTimeline(songID){
		let timeLine = ReactDOM.findDOMNode(this.refs["timeline_"+songID])
		let ctx = timeLine.getContext('2d')
		ctx.clearRect(0, 0, 280, 128)
	}

	audioEnded(event){
		let soundID = event.target.dataset.id
		let player = ReactDOM.findDOMNode(this.refs[soundID])
		player.pause()
		player.currentTime = 0
		if(soundID === this.state.playingSoundID){
			this.clearTimeline(soundID)
			this.setState({ playingSoundID: null })
		}
	}

	importSound(soundID){
		let player = ReactDOM.findDOMNode(this.refs[soundID])
		if(player.src){
      this.props.importSound(player, "Imported stock sound")
    }
    else {
    	let self = this
		  const infolink = "/api/asset/sound/" + soundID;
      $.get(infolink, (data) => {
        player.src = data.dataUri
        self.props.importSound(player, "Imported stock sound")
      })
    }
	}

	formatDuration(sec){
		if(!sec) sec = 1;
		sec = Math.round(sec);
		let min = Math.floor(sec/60) + "";
		if(min.length < 2) min = "0"+min;
		sec = (sec%60) + "";
		if(sec.length < 2) sec = "0"+sec;
		return min+":"+sec;
	}

	render(){
		let soundItems = _.map(this.state.sounds, (sound, nr) => { 
			return (
			  <div 
			  key={"soundKey_"+nr} 
			  className="item" 
			  style={{width: "280px", margin: "3px", overflow: "hidden", position: "relative", border: "1px solid #fbe6fb", float: "left"}}>
			  	<img src={sound.thumbnail} style={{ }}/>
			  	{/* <div ref={"timeline_"+sound._id} style={{ backgroundColor: "#c3c3c3", height: "128px", marginTop: "-134px", opacity: 0.5}}></div>	*/}
			  	<canvas height="128px" width="280px" ref={"timeline_"+sound._id} style={{opacity: 0.5, position: "absolute", top:0, left: 0}}></canvas>
			  	<button onClick={this.togglePlay.bind(this, sound._id)} className="ui icon button">
            <i className={"icon " + (this.state.playingSoundID === sound._id ? "pause" : "play")}></i>
          </button>		    
			    {sound.name}
			    &nbsp;&nbsp;
			    ({this.formatDuration(sound.duration)})
			    <audio ref={sound._id} data-id={sound._id} onEnded={this.audioEnded.bind(this)}></audio>
			    <button onClick={this.importSound.bind(this, sound._id)} className="ui icon right floated button">
            <i className="add square icon"></i>
          </button>          
			  </div>
			)
		})

		return (
			<div className="content">

				<div className="ui action input">
          <input onChange={this.searchOnChange.bind(this)} type="text" placeholder="Sound name..." />
          <button onClick={this.searchOnSubmit.bind(this)} className="ui button">Search</button>
        </div>

        <div className="ui divider"></div>

        <div>
          {soundItems}
        </div>
        <div>&nbsp;</div>

	    </div>
		);
	}	
}