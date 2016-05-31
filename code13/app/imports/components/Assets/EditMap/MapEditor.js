import React from 'react';
export default class MapEditor extends React.Component {
  
  componentWillReceiveProps (props){
    console.log("PROPS:", props);
  }
  
  render (){
    console.log(this.state);
    return (
      <div>MAP</div>
    )
  }
};
