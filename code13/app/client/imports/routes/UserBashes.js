import React from 'react'
import { Container, Grid, Header, Icon, List } from 'semantic-ui-react'

export default UserBashes = () => (
  <Container>
    <Grid padded>
      <Grid.Column width={16}>
        <Header as='h2'>
          <Icon name='plug' color='orange'/>
          <Header.Content>
            "User Bash" Testing
            <Header.Subheader>
              4th and 5th of February -  10am-11am PST
            </Header.Subheader>
          </Header.Content> 
        </Header>
      </Grid.Column>

      <Grid.Column width={8}>
        <Header as='h2' content='For visual coders' />
        <b>Task</b> - fork an existing project and add more gameplay <br/>
        <b>Project to fork</b> - <QLink to='/u/!vault/project/2CT3etw9K7s7tiM4b'>Dwarfs</QLink>   <br/>
        <b>Graphics assets</b> - <QLink to='/u/!vault/assets' query={{project:'DwarfsGraphics'}}>Characters, objects, animations</QLink> <br/>
        <br/>
        <b>Examples</b>
        <List bulleted>
          <List.Item><QLink to='/u/!vault/asset/X8P7sLMovtS9uLafE'>Ice Game</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/anjK2GisLZzjHbZoM'>Burger Man</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/2hLCWWC7W43Dor9En'>Chronicles of Mr. Gum</QLink></List.Item>
        </List>

      </Grid.Column>

      <Grid.Column width={8}>
        <Header as='h2' content='For JavaScript coders' />
        <b>Task</b> - fork an existing project and add more gameplay <br/>
        <b>Code to fork</b> - <QLink to='/u/guntis/asset/9xXHRdGFjkMmzQFNh'>Dwarf game template</QLink> <br/>
        <b>Graphics assets</b> - <QLink to='/u/!vault/assets' query={{project:'DwarfsGraphics'}}>Characters, objects, animations</QLink> <br/>
        <br/>
        Here are some basic concepts to work with:
        <br/><br/>

        <b>Basics</b> - PhaserJS Basics
        <List bulleted>
          <List.Item><QLink to='/u/!vault/asset/5Bm4R9kJHRAMBv4kD'>loadImage</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/9B2BypiBuezef3WAa'>moveImage</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/wsntd5Q4tjRXJZjf4'>clickImage</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/tRk4y5QziKfpocu5P'>text</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/5orEE4ksP8hehbM6W'>animation</QLink></List.Item>
        </List>

        <b>Sprites</b> - Drawing and manipulating images (sprites)
        <List bulleted>
          <List.Item><QLink to='/u/!vault/asset/3KRJJQKHofRt3dsNK'>add</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/4TS5WGRAFC5Ei8Nv4'>scale</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/m2nq9brBoiKwRyk6o'>spritesheet</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/gadZ24syWJFsgXNkt'>rotate</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/7J2oteAjfGagQ22ka'>destroy</QLink></List.Item>
        </List>

        <b>Input</b> - Mouse, touch and keyboard
        <List bulleted>
          <List.Item><QLink to='/u/!vault/asset/FPBvhLyJBEcxAzWtE'>clickGame</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/ENnr8RSrrSRB3ybTg'>clickOnSprite</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/zTz9kJSPDKEDvYCes'>keyboard</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/BiR4gi4QpAKpt4LQs'>drag</QLink></List.Item>
        </List>

        <b>Animation</b> - Animations
        <List bulleted>
          <List.Item><QLink to='/u/!vault/asset/3NsERDpJx7cKEbEtX'>changeFrame</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/4Jhud3bpJ3C8LF4Lm'>events</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/QN7cKdBnoZ2dKjj3m'>multipleAnimations</QLink></List.Item>
        </List>

        <b>Physics</b> - Simple physics: collision detection, bounding boxes
        <List bulleted>
          <List.Item><QLink to='/u/!vault/asset/9dhJ2jzY7iER84GeM'>collide</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/cvCc7dgYesdKE6iRQ'>gravity</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/5KR4csaxvkasSH9Kf'>boundingBox</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/x2LRQAepfuMbmXsEi'>bodySize</QLink></List.Item>
        </List>

        <b>Simple Games</b>
        <List bulleted>
          <List.Item><QLink to='/u/!vault/assets' query={{project: 'SimpleMole'}}>Whack a Mole</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/asset/EzrCZqNsq9xePyfHp'>Angry Birds</QLink></List.Item>
          <List.Item><QLink to='/u/!vault/assets' query={{project: 'RockySmasher'}}>Rocky Smasher</QLink></List.Item>
        </List>


      </Grid.Column>
    </Grid>
  </Container>
)
