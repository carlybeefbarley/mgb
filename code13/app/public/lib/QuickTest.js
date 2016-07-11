/*
As with dependency count compilation times starting to exceed 1 minute
this is quick test - how to avoid compilation

The Idea behind this is that we define global variable and when all is done we replace
window.QuickTest
with
module exports default QuickTest

usage:
in the required component use e.g. jquery to load this file and access class as global variable

example:
// standard ES6 imports
import React from 'react';
// this will load QuickTest in the old fashion
$.getScript("/lib/QuickTest.js");

export default class MyComponent extends React.Component {
  constructor(...args){
    super(...args);
    this.myTest = new QuickTest("MyComponent", (success) => {
      this.element.innerHTML = ("Test: "+ (success ? "succeeded" : "failed"));
    });
  }
  render(){
    return <div ref=()=>{this.myTest.run();}></div>
  }
}
 */

// chrome already supports most IE6 features
"use strict";
window.QuickTest = class{
  constructor(name, callback){
    this.name = name;
    this.callback = callback;
    this.runs = 0;
  }

  run(callback = this.callback, timeout = Math.random() * 5000){
    this.runs++;
    window.setTimeout(() => {
      callback(Math.random() > 0.5);
    }, timeout);
  }
};
