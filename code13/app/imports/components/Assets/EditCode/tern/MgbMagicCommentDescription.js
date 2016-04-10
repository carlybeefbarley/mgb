import React, { PropTypes } from 'react';


export default MgbMagicCommentDescription = React.createClass({
  propTypes: {
    currentLineDeterminesGameEngine: PropTypes.string,
    mgbopt_game_engine: PropTypes.string,
    defaultPhaserVersionNNN: PropTypes.string

    },


  render: function() {

    if (!this.props.currentLineDeterminesGameEngine)
      return null
 
     return (
      <div className="ui green segment" style={{backgroundColor: "rgba(0,255,0,0.03)"}}>
        <p>
          The comment
          <code style={{color: "green"}}><small>
            <br></br>
            &nbsp;&nbsp;//MGBOPT_phaser_version={this.props.currentLineDeterminesGameEngine}
            <br></br>
          </small></code> 
          is a special comment that MGB looks for. 
          These comments are used just by MGB to force the usage of a specific version of the <a href="//phaser.io">Phaser</a> game engine when running your code.
        </p>
        <p>
          In this file, the 
          &nbsp;<code><small>//MGBOPT_phaser_version=...</small></code>&nbsp;
          special comment(s) are causing the following version of phaser to be pre-loaded:&nbsp;
          <code><small><a href={this.props.mgbopt_game_engine}>{this.props.mgbopt_game_engine}</a></small></code>
        </p>
        
        <p>
          This override is useful when working with a tutorial from an older version of Phaser, in order to avoid incompatibilities. 
          If no version is specifically selected, the default version is {this.props.defaultPhaserVersionNNN}. 
          The full list of <a href="//phaser.io">Phaser</a> versions is at <a href="http://phaser.io/download/archive">http://phaser.io/download/archive</a>.                  
        </p>
        <p>
          NOTE: If there are multiple lines with this selection, ONLY the first one will be used.
        </p>
      </div>
    )
  }
  
})