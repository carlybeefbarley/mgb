"use strict";
import React from "react";
import ReactDOM from 'react-dom';

const CTRL = 1 << 8;
const SHIFT = 1 << 9;
const ALT = 1 << 10;

export default class Toolbar extends React.Component {

  constructor(...args){
    super(...args);

    this.keyActions = {};
    window._toolbar_known_actions = window._toolbar_known_actions || {};
    // this is for debugging purposes atm
    this.level = this.props.config.level;
    console.log("LEVEL set to :", this.level);
    let levelSlider = document.getElementById("levelSlider");
    if(!levelSlider){
      levelSlider = document.createElement("input");
      levelSlider.setAttribute("id", "levelSlider");
      levelSlider.setAttribute("type", "range");
      levelSlider.setAttribute("min", "1");
      levelSlider.setAttribute("max", "10");
      levelSlider.setAttribute("step", "1");

      levelSlider.style.position = "absolute";
      levelSlider.style.bottom = "0";
      levelSlider.style.left = "0";
      levelSlider.style.zIndex = "666";

      document.body.appendChild(levelSlider);
    }

    levelSlider.value = this.level;
    this.levelSlider = levelSlider;

    this._onChange = () => {
      this.level = parseInt(levelSlider.value, 10);
      this.forceUpdate();
    };

    this._onKeyUp = (e) => {
      let keyval = e.which;
      // TODO: ADD OSX CMD.. threat as CTRL? ASK @dgolds
      e.shiftKey && (keyval |= SHIFT);
      e.ctrlKey && (keyval |= CTRL);
      e.altKey && (keyval |= ALT);

      if(this.keyActions[keyval]){
        e.preventDefault();
        this.keyActions[keyval](e);
      }
    };
  }

  componentDidMount(){
    this.levelSlider.addEventListener("input", this._onChange);

    let $a = $(ReactDOM.findDOMNode(this));
    $a.find('.hazPopup').popup( { delay: {show: 250, hide: 0}} );

    window.addEventListener("keyup", this._onKeyUp);

  }
  componentWillUnmount(){
    this.levelSlider.removeEventListener("input", this._onChange);
    window.removeEventListener("keyup", this._onKeyUp);
  }

  registerShortcut(shortcut, action){
    const keys = shortcut.split("+");
    // create unique index where
    // first 8 bits is keycode
    // 9th bit is Ctrl
    // 10th bit is Shift
    // 11th bit is Alt
    let keyval = 0;
    for(let i=0; i<keys.length; i++){
      const key = keys[i].toLowerCase().trim();
      switch(key){
        case "ctrl":
              keyval |= CTRL;
              break;
        case "alt":
              keyval |= ALT;
              break;
        case "shift":
              keyval |= SHIFT;
              break;
        default:
              if(key.length > 1){
                console.error("unknown key: [" + key + "]");
              }
              keyval |= key.toUpperCase().charCodeAt(0);
              break;
      }
    }
    // TODO: check duplicate shortcuts?
    if(!this.props.actions[action]){
      console.error("missing action:", action);
      return;
    }
    this.keyActions[keyval] = this.props.actions[action].bind(this.props.actions);
  }


  render(){
    let size;
    // TODO: are 3 levels enough
    if(this.level < 3){
      size = "big";
    }
    else if(this.level < 6){
      size = "medium"
    }
    else{
      size = "tiny";
    }

    const buttons = [];
    let parent = [];
    buttons.push(parent);

    let b;
    for(let i=0; i<this.props.config.buttons.length; i++){
      b = this.props.config.buttons[i];
      if(b.name == "separator"){
        parent = [];
        buttons.push(parent);
        continue;
      }
      parent.push(this._renderButton(b, i));
    }

    const content = [];
    buttons.forEach((b, i) => {
      content.push(<div className={"ui icon buttons animate " + size + " " + "level" + this.level} key={i}>{b}</div>)
    });

    return <div>{content}</div>;
  }

  /* private methods goes here */
  _handleClick(action, e){
    if(this.props.actions[action]){
      this.props.actions[action](e);
    }
    else{
      console.error("Cannot find action for button:", action);
    }
  }

  _renderButton(b, index){
    if(b.component){
      return b.component;
    }
    const label = this.level <= 3 ? [<br />, b.label] : '';
    const title = this.level > 3 ? b.label : '';
    const hidden = b.level > this.level ? " hidden" : '';
    const active = b.active ? " primary" : '';
    const disabled = b.disabled ? " disabled" : '';
    if(b.shortcut){
      this.registerShortcut(b.shortcut, b.name);
    }
    return (
      <div className={"ui button hazPopup animate " + hidden + active + disabled}
           onClick={this._handleClick.bind(this, b.name)}
           data-title={title}
           data-content={b.tooltip + (b.shortcut ? " [" + b.shortcut + "]" : '')}
           data-position="top center"
           key={index}
        ><i className={(b.icon ? b.icon : b.name) + " icon"}></i>{b.iconText ? b.iconText : ''}
        {label}
      </div>
    );
  }
}
