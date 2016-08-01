import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class SoundStock extends React.Component {

	constructor(props) {
  	super(props);

  	this.state = {
  		searchField: "sound"
  		, sounds: []
  	}

  	this.searchOnSubmit() // to be deleted
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

	playSound(soundID){
		let player = ReactDOM.findDOMNode(this.refs[soundID])
		if(player.src){
			player.play()
		}
		else {
		  let self = this
		  const infolink = "/api/asset/sound/" + soundID;
      $.get(infolink, (data) => {
        player.src = data.dataUri
        player.play()
      })
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

	render(){
		let soundItems = _.map(this.state.sounds, (sound, nr) => { 
			return (
			  <div key={"soundKey_"+nr} className="item">
			    <button onClick={this.playSound.bind(this, sound._id)} className="ui icon button">
            <i className="play icon"></i>
          </button>
			    {sound.name}
			    &nbsp;&nbsp;
			    {sound.duration}
			    <audio ref={sound._id}></audio>
			    <button onClick={this.importSound.bind(this, sound._id)} className="ui icon right floated button">
            <i className="add square icon"></i> Import sound
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

        <div className="ui list">
          {soundItems}
        </div>

	    </div>
		);
	}	
}