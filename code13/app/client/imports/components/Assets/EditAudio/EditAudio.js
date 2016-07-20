import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import ImportAudio from './ImportAudio.js';
import AudioStock from './AudioStock.js';
import WaveSurfer from './WaveSurfer.js'

const TABS = {
	IMPORT: 1
	, STOCK: 2
}

export default class EditAudio extends React.Component {

	constructor(props) {
  	super(props);

  	// console.log(props);

  	this.state = {
  		activeTab: TABS.IMPORT
  	}
	}

	changeTab(tabID){
		this.setState({activeTab: tabID});
	}

	handleSave(changeText="change audio")
  {
    if (!this.props.canEdit)
    {
      this.props.editDeniedReminder()
      return
    }


    // this.props.handleContentChange(this.props.asset.content2, null, changeText);
  }

	render(){
		let tabContent;
		switch(this.state.activeTab){ 
			case TABS.IMPORT:
			default:                                                                           
				tabContent = <ImportAudio />;
				break;
			case TABS.STOCK:
				tabContent = <AudioStock />;
				break;
		}

		return (
			<div className="ui grid">
				<div className="ui four wide column">
					<button className="ui icon button"
						onClick={this.changeTab.bind(this, TABS.IMPORT)}>
					  <i className="add square icon"></i> Import (.ogg)
					</button>
					<button className="ui icon button"
						onClick={this.changeTab.bind(this, TABS.STOCK)}>
					  <i className="folder icon"></i> Stock Audio
					</button>
				</div>
				<div className="ui ten wide column">
					{tabContent}
				</div>
			</div>
		);
	}	
}