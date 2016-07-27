import _ from 'lodash';
import React, { PropTypes } from 'react';


//        <h1>𝌮</h1>

const allSizesCss = {
  "small":  {  width: "44px", height: "60px" },
  "normal": {  width: "88px", height: "120px" }
}

export default SkillsMap = React.createClass({

  propTypes: {
    user: PropTypes.object,
    size: PropTypes.string.isRequired          // "small" / "normal"
  },

  getDefaultProps: function() {
    return {
      size: 'normal'
    }
  },

  render: function()
  {
    const sizeCss = allSizesCss[this.props.size] || allSizesCss["normal"]

    const sty = {
      ...sizeCss,
      backgroundColor: "rgba(0,0,0,0.2)"
    }

    return <div style={sty}></div>
  }

})
