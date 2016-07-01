import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor'; // eslint-disable-line import/no-unresolved
import createHashtagPlugin from 'draft-js-hashtag-plugin'; // eslint-disable-line import/no-unresolved
import createStickerPlugin from 'draft-js-sticker-plugin'; // eslint-disable-line import/no-unresolved
import createLinkifyPlugin from 'draft-js-linkify-plugin'; // eslint-disable-line import/no-unresolved
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import createEmojiPlugin from 'draft-js-emoji-plugin'; // eslint-disable-line import/no-unresolved
import createUndoPlugin from 'draft-js-undo-plugin'; // eslint-disable-line import/no-unresolved
import createRichButtonsPlugin from 'draft-js-richbuttons-plugin';
import undoStyles from 'draft-js-undo-plugin/lib/plugin.css';
import hashtagStyles from 'draft-js-hashtag-plugin/lib/plugin.css';
import stickerStyles from 'draft-js-sticker-plugin/lib/plugin.css';
import mentionStyles from 'draft-js-mention-plugin/lib/plugin.css';
import emojiStyles from 'draft-js-emoji-plugin/lib/plugin.css';
import linkifyStyles from 'draft-js-linkify-plugin/lib/plugin.css';
import styles from './styles.css';
import draftStyles from 'draft-js/dist/Draft.css';

// This is using https://www.draft-js-plugins.com/ which is a simplified wrapper over draft.js, 
// but it has some problems..

  // #1 If using a draft.js version 0.7 or later, you may hit problems with 
  // plugins (e.g sticker and blockRenderMap - see https://github.com/draft-js-plugins/draft-js-plugins/issues/281)
  // draftjs v0.6.x seems ok.
  //import {DefaultDraftBlockRenderMap} from 'draft-js';

  // #2 Bizarrely you need to define the controls after the editor. 
  // It's possible to work around this with some CSS but it's a bit stupid

  // #3. Emoji seems broken even with draftjs 0.6

import stickers from './stickers';
import mentions from './mentions';
import {
  // convertToRaw,
  //convertFromRaw,
  ContentState,
  EditorState,
} from 'draft-js';
//import initialState from './initialState';

const emojiPlugin = createEmojiPlugin();
const hashtagPlugin = createHashtagPlugin();
const linkifyPlugin = createLinkifyPlugin();
const mentionPlugin = createMentionPlugin();
const undoPlugin = createUndoPlugin();
const stickerPlugin = createStickerPlugin({
  stickers,
});

const { MentionSuggestions } = mentionPlugin;
const { EmojiSuggestions } = emojiPlugin;
const { StickerSelect } = stickerPlugin;
const { UndoButton, RedoButton } = undoPlugin;

// Rich Buttons Plugin:  https://github.com/jasonphillips/draft-js-richbuttons-plugin
const richButtonsPlugin = createRichButtonsPlugin();
const {   
  // inline buttons
  ItalicButton, BoldButton, MonospaceButton, UnderlineButton,
  // block buttons
  ParagraphButton, BlockquoteButton, CodeButton, OLButton, ULButton, H1Button, H2Button, H3Button, H4Button, H5Button, H6Button
} = richButtonsPlugin;

const MyIconButton = ({iconName, toggleInlineStyle, isActive, label, inlineStyle, onMouseDown }) =>
  <button className="ui small compact icon button" onClick={toggleInlineStyle} onMouseDown={onMouseDown}>
    <i  className={iconName + " icon"}
        toolTip={label}
        style={{ color: isActive ? '#000' : '#777' }}
    />
  </button>;

const MyIconBlockButton = ({iconName, toggleBlockType, isActive, label }) =>
  <button className="ui small compact icon button" onClick={toggleBlockType} >
    <i  className={iconName + " icon"}
        toolTip={label}
        style={{ color: isActive ? '#000' : '#777' }}
    />
  </button>;
  

const plugins = [
  emojiPlugin,
  hashtagPlugin,
  stickerPlugin,
  linkifyPlugin,
  mentionPlugin,
  undoPlugin,
  richButtonsPlugin,
];



//const contentState = ContentState.createFromBlockArray(convertFromRaw(initialState));
const contentState = ContentState.createFromText(`You can edit here, but this won't save yet. I'm not sure yet how I feel about draftjs as a editor`);

export default class EditDoc extends Component {

  state = {
    editorState: EditorState.createWithContent(contentState),
    suggestions: mentions,
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });

    // console.log(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
  };

  onMentionSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions),
    });
  };

  focus = () => {
    this.refs.editor.focus();
  };


  render() {
    return (
      <div className={styles.root}>
        <div className={styles.editor} onClick={this.focus}>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            spellCheck
            ref="editor"
          />
        </div>
        <div>
          <MentionSuggestions
            onSearchChange={this.onMentionSearchChange}
            suggestions={this.state.suggestions}
          />
          <EmojiSuggestions />
          <div className={styles.editorButton}>
            <StickerSelect editor={this} />
          </div>
          <div className={styles.editorButton}>
            <UndoButton />
          </div>
          <div className={styles.editorButton}>
            <RedoButton />
          </div>
          <div className="myToolbar">
            <BoldButton>
              <MyIconButton iconName="bold"/>
            </BoldButton>
            <ItalicButton>
              <MyIconButton iconName="italic"/>
            </ItalicButton>
            <UnderlineButton>
              <MyIconButton iconName="underline"/>
            </UnderlineButton>
            <MonospaceButton>
              <MyIconButton iconName="code"/>
            </MonospaceButton>
            &nbsp;
            <H1Button/>
            <H2Button/>
            <H3Button/>
            &nbsp;
            <ParagraphButton/>
            <BlockquoteButton/>
            <CodeButton/>
            &nbsp;
            <ULButton>
              <MyIconBlockButton iconName="list"/>
            </ULButton>
            <OLButton>
              <MyIconBlockButton iconName="ordered list"/>
            </OLButton>
          </div>
        </div>
      </div>
    );
  }
}