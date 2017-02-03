import React, { PropTypes, Component } from 'react'
import { showToast } from '/client/imports/routes/App'

import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'

import CodePhaserSkillNodes from '/imports/Skills/SkillNodes/CodePhaserSkillNodes.js'


export default UserBashes = React.createClass({

  propTypes: {
    params: PropTypes.object,           // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object,             // Maybe absent if route is /assets
    currUser: PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array, 
    ownsProfile: PropTypes.bool,
    location: PropTypes.object          // We get this from react-router
  },


  render: function(){

    


    

    return (
      <div>
        <h1>Testing 4th and 5th of February</h1>
        <div className="ui grid">
          <div className="eight wide column">
            <h2>For visual coders</h2>
            <b>Task</b> - fork an existing project and add more gameplay <br/>
            <b>Project to fork</b> - // TODO needs link   <br/>
            <b>Graphics assets</b> - <QLink to={`/u/!vault/assets?_fp=assets&project=DwarfsGraphics`}>Characters, objects, animations</QLink> <br/>
          </div>


          <div className="eight wide column">

            <h2>For coders</h2>
            <b>Task</b> - fork an existing project and add more gameplay <br/>
            <b>Code to fork</b> - <QLink to={`/u/guntis/asset/9xXHRdGFjkMmzQFNh`}>Dwarf game template</QLink> <br/>
            <b>Graphics assets</b> - <QLink to={`/u/!vault/assets?_fp=assets&project=DwarfsGraphics`}>Characters, objects, animations</QLink> <br/>
            <br/>
            Here are some basic concepts to take a sneak peek: 
            <br/><br/>

            <b>Basics</b> - PhaserJS Basics
            <div className="ui bulleted list">
              <div className="item"><QLink to={`/u/!vault/asset/5Bm4R9kJHRAMBv4kD`}>loadImage</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/9B2BypiBuezef3WAa`}>moveImage</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/wsntd5Q4tjRXJZjf4`}>clickImage</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/tRk4y5QziKfpocu5P`}>text</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/5orEE4ksP8hehbM6W`}>animation</QLink></div>
            </div>

            <b>Sprites</b> - Drawing and manipulating images (sprites)
            <div className="ui bulleted list">
              <div className="item"><QLink to={`/u/!vault/asset/3KRJJQKHofRt3dsNK`}>add</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/4TS5WGRAFC5Ei8Nv4`}>scale</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/m2nq9brBoiKwRyk6o`}>spritesheet</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/gadZ24syWJFsgXNkt`}>rotate</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/7J2oteAjfGagQ22ka`}>destroy</QLink></div>
            </div>

            <b>Input</b> - Mouse, touch and keyboard
            <div className="ui bulleted list">
              <div className="item"><QLink to={`/u/!vault/asset/FPBvhLyJBEcxAzWtE`}>clickGame</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/ENnr8RSrrSRB3ybTg`}>clickOnSprite</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/zTz9kJSPDKEDvYCes`}>keyboard</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/BiR4gi4QpAKpt4LQs`}>drag</QLink></div>
            </div>

            <b>Animation</b> - Animations
            <div className="ui bulleted list">
              <div className="item"><QLink to={`/u/!vault/asset/3NsERDpJx7cKEbEtX`}>changeFrame</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/4Jhud3bpJ3C8LF4Lm`}>events</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/QN7cKdBnoZ2dKjj3m`}>multipleAnimations</QLink></div>
            </div>

            <b>Physics</b> - Simple physics: collision detection, bounding boxes
            <div className="ui bulleted list">
              <div className="item"><QLink to={`/u/!vault/asset/9dhJ2jzY7iER84GeM`}>collide</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/cvCc7dgYesdKE6iRQ`}>gravity</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/5KR4csaxvkasSH9Kf`}>boundingBox</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/x2LRQAepfuMbmXsEi`}>bodySize</QLink></div>
              <div className="item"><QLink to={`/u/!vault/asset/EzrCZqNsq9xePyfHp`}>angryBirds</QLink></div>
            </div>

          </div>
        </div>
      </div>
    )
  },

})