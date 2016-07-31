import _ from 'lodash';
import React from 'react';
import Footer from '/client/imports/components/Footer/Footer';

export default Roadmap = React.createClass({

  render: function() {
    return (
      <div>
        <div className="ui basic segment">
          <div className="ui container">
            <h2 className="ui header"><i className="map icon" />Feature Roadmap</h2>
            { this.renderRoadmap() }
          </div>
        </div>
        <Footer />
      </div>
    )
  },

  renderRoadmap: function() {
    return (
      <div>
        <h2>Features planned for August 2016</h2>
        <ul>
          <li>Choose your avatar (not just gravatars)</li>
          <li>MGBv1 asset migration (tiles, actors, maps)</li>
          <li>MGBv1-style 'Actor' assets which enable game building without coding</li>
          <li>Lots of work on the Code Editor and Coding help systems</li>
          <li>Allow project members to edit assets in your projects</li>
          <li>Chat improvements (notifications, DMs etc)</li>
          <li>A new 'Game' asset will provide a way to promote games and track plays</li>
          <li>Tutorial and progression systems to help learn how to make games</li>
        </ul>
      </div>
    )
  },

})