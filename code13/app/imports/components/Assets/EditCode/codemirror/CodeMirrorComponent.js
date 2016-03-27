import React, { PropTypes } from 'react';

// NOT YET USED. NEED TO REFACTOR EditCode into using this (or something like it)

// Import CodeMirror and its various dependencies.
//   This is not as simple as it might sound...

// 1) Due to Meteor 1.3 import limitations, there are also symlinks in the 
//    /package-assets-symlink-hack/ directory for the CSS etc files that 
//    CodeMirror needs.
// 2) We load JSHINT from /app.htm in browser because JSHINT redefines some fundamental
//    globals like 'utils' and 'event', and that confuses node/meteor greatly.
//
// Things get even more complicated once TERN (the code analysis system use for autocomplete smarts)
import CM from 'codemirror';

// CodeMirror Modes we will support
import cm_modejs from 'codemirror/mode/javascript/javascript';

// CodeMirror addons for cool IDE-like functions
import cm_showhint from 'codemirror/addon/hint/show-hint';
// NOTE: 

//import cm_closebrackets from 'codemirror/addon/edit/closetag';
import cm_closebrackets from 'codemirror/addon/edit/closebrackets';
import cm_matchbrackets from 'codemirror/addon/edit/matchbrackets';
import cm_activeline from 'codemirror/addon/selection/active-line';

import cm_fold_code from 'codemirror/addon/fold/foldcode';
import cm_fold_gutter from 'codemirror/addon/fold/foldgutter';
//<link rel="stylesheet" href="/codemirror/addon/fold/foldgutter.css">
import cm_fold_brace from 'codemirror/addon/fold/brace-fold';
import cm_fold_comment from 'codemirror/addon/fold/comment-fold';
// import cm_fold_ from 'codemirror/addon/fold/xml-fold';
// import cm_fold_ from 'codemirror/addon/fold/markdown-fold';

import cm_dialog from 'codemirror/addon/dialog/dialog';

import cm_annotatescrollbar from 'codemirror/addon/scroll/annotatescrollbar';
import cm_matchesonscrollbar from 'codemirror/addon/search/matchesonscrollbar';
//<link rel="stylesheet" href="/codemirror/addon/search/matchesonscrollbar.css">

import cm_jumptoline from 'codemirror/addon/search/jump-to-line';

import cm_lint from 'codemirror/addon/lint/lint';
//<link rel="stylesheet" href="/codemirror/addon/lint/lint.css">
import cm_jslint from 'codemirror/addon/lint/javascript-lint';
import cm_jsonlint from 'codemirror/addon/lint/json-lint';

import cm_searchcursor from 'codemirror/addon/search/searchcursor';
import cm_search from 'codemirror/addon/search/search';




export default CodeMirror = React.createClass({
	propTypes: {
		onChange: React.PropTypes.func,
		onFocusChange: React.PropTypes.func,
		options: React.PropTypes.object,
		path: React.PropTypes.string,
		value: React.PropTypes.string,
		className: React.PropTypes.any,
	},
  
	getInitialState () {
		return {
			isFocused: false,
		};
	},
  
	componentDidMount () {
		const textareaNode = this.refs.textarea;
		this.codeMirror = CM.fromTextArea(textareaNode, this.props.options);
		this.codeMirror.on('change', this.codemirrorValueChanged);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this._currentCodemirrorValue = this.props.defaultValue || this.props.value || '';
		this.codeMirror.setValue(this._currentCodemirrorValue);
	},
	componentWillUnmount () {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror) {
			this.codeMirror.toTextArea();
		}
	},
	componentWillReceiveProps (nextProps) {
		if (this.codeMirror && nextProps.value !== undefined && this._currentCodemirrorValue !== nextProps.value) {
			this.codeMirror.setValue(nextProps.value);
		}
		if (typeof nextProps.options === 'object') {
			for (let optionName in nextProps.options) {
				if (nextProps.options.hasOwnProperty(optionName)) {
					this.codeMirror.setOption(optionName, nextProps.options[optionName]);
				}
			}
		}
	},
  
  // per https://codemirror.net/doc/manual.html, the returned CodeMirror Instance has three additional methods:
  //    cm.save(),  cm.toTextArea(),  cm.getTextArea()
	getCodeMirrorInstance () {
		return this.codeMirror;
	},
  
  // return the CodeMirror reference (CM) we imported as a module
  // This is similar but different to the CodeMirror Instances (which are typically bound to editors and docs)
  getCodeMirrorGlobalCM() {
    return CM;
  },
  
	focus () {
		if (this.codeMirror) {
			this.codeMirror.focus();
		}
	},
  
	focusChanged (focused) {
		this.setState({
			isFocused: focused,
		});
		this.props.onFocusChange && this.props.onFocusChange(focused);
	},
  
	codemirrorValueChanged (doc, change) {
		const newValue = doc.getValue();
		this._currentCodemirrorValue = newValue;
		this.props.onChange && this.props.onChange(newValue);
	},
  
	render () {
		const editorClassName = className(
			'ReactCodeMirror',
			this.state.isFocused ? 'ReactCodeMirror--focused' : null,
			this.props.className
		);
		return (
			<div className={editorClassName}>
				<textarea ref="textarea" name={this.props.path} defaultValue={this.props.value} autoComplete="off" />
			</div>
		);
	},
});

module.exports = CodeMirror;