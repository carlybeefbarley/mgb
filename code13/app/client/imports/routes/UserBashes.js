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
        For those who want to code there is a list of simple examples of concepts:
        <br/><br/><br/>

        <b>Basics</b> - PhaserJS Basics
        <ul>
          <li><QLink to={`/u/!vault/asset/5Bm4R9kJHRAMBv4kD`}>loadImage</QLink></li>
          <li><QLink to={`/u/!vault/asset/9B2BypiBuezef3WAa`}>moveImage</QLink></li>
          <li><QLink to={`/u/!vault/asset/wsntd5Q4tjRXJZjf4`}>clickImage</QLink></li>
          <li><QLink to={`/u/!vault/asset/tRk4y5QziKfpocu5P`}>text</QLink></li>
          <li><QLink to={`/u/!vault/asset/5orEE4ksP8hehbM6W`}>animation</QLink></li>
        </ul>

        <b>Sprites</b> - Drawing and manipulating images (sprites)
        <ul>
          <li><QLink to={`/u/!vault/asset/3KRJJQKHofRt3dsNK`}>add</QLink></li>
          <li><QLink to={`/u/!vault/asset/4TS5WGRAFC5Ei8Nv4`}>scale</QLink></li>
          <li><QLink to={`/u/!vault/asset/m2nq9brBoiKwRyk6o`}>spritesheet</QLink></li>
          <li><QLink to={`/u/!vault/asset/gadZ24syWJFsgXNkt`}>rotate</QLink></li>
          <li><QLink to={`/u/!vault/asset/7J2oteAjfGagQ22ka`}>destroy</QLink></li>
        </ul>

        <b>Input</b> - Mouse, touch and keyboard
        <ul>
          <li><QLink to={`/u/!vault/asset/FPBvhLyJBEcxAzWtE`}>clickGame</QLink></li>
          <li><QLink to={`/u/!vault/asset/ENnr8RSrrSRB3ybTg`}>clickOnSprite</QLink></li>
          <li><QLink to={`/u/!vault/asset/zTz9kJSPDKEDvYCes`}>keyboard</QLink></li>
          <li><QLink to={`/u/!vault/asset/BiR4gi4QpAKpt4LQs`}>drag</QLink></li>
        </ul>

        <b>Animation</b> - Animations
        <ul>
          <li><QLink to={`/u/!vault/asset/3NsERDpJx7cKEbEtX`}>changeFrame</QLink></li>
          <li><QLink to={`/u/!vault/asset/4Jhud3bpJ3C8LF4Lm`}>events</QLink></li>
          <li><QLink to={`/u/!vault/asset/QN7cKdBnoZ2dKjj3m`}>multipleAnimations</QLink></li>
        </ul>

        <b>Physics</b> - Simple physics: collision detection, bounding boxes
          <ul>
          <li><QLink to={`/u/!vault/asset/9dhJ2jzY7iER84GeM`}>collide</QLink></li>
          <li><QLink to={`/u/!vault/asset/cvCc7dgYesdKE6iRQ`}>gravity</QLink></li>
          <li><QLink to={`/u/!vault/asset/5KR4csaxvkasSH9Kf`}>boundingBox</QLink></li>
          <li><QLink to={`/u/!vault/asset/x2LRQAepfuMbmXsEi`}>bodySize</QLink></li>
          <li><QLink to={`/u/!vault/asset/EzrCZqNsq9xePyfHp`}>angryBirds</QLink></li>
        </ul>
      </div>
    )
  },

})