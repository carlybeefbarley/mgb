
import React, { PropTypes } from 'react'
import { Segment, Header, Item, Checkbox } from 'semantic-ui-react'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'

export default class EditGame extends React.Component 
{
  constructor(props) {
    super(props)
    this.state = {
      startClientCodeAsset: '',
      coverImage: ''
      
    }
  }

  render() {
    const { startClientCodeAsset, coverImage } = this.state
    const { asset, canEdit } = this.props
    const isAssetNameValid = false

    return (
      <div>
        <Header as='h2' className="ui header">{asset.name}</Header>
        <Segment padded>
          <Header as='h4' className="ui header">Starting Code Asset</Header>
          <Item.Group>
            <div className={"ui fluid input" + (isAssetNameValid ? "" : " error")}>
              <input 
                  className="fluid" 
                  type="text" 
                  value={startClientCodeAsset} 
                  onChange={(e) => this.setState({ startClientCodeAsset: e.target.value})}
                  ref="inputAssetName">
              </input>
            </div>
          </Item.Group>
        </Segment>

        <Segment className="ui padded segment">
          <Header as='h4' className="ui header">Game Cover Image</Header>
            <QLink className="image" to={'/'} elOverride='div'>
              <ImageShowOrChange
                className="image"
                imageSrc={coverImage}
                canEdit={canEdit}
                canLinkToSrc={canEdit}
                handleChange={(newUrl, newId ) => console.log('TODO: CHANGE IMAGE' , newUrl, newId ) } />
            </QLink>
        </Segment>        

        <Segment className="ui padded segment">
          <Header as='h4' className="ui header">Screen Sizes</Header>
          <Checkbox label='Smartphone (portrait)' />
          <br />
          <Checkbox label='Smartphone (landscape)' />
          <br />
          <Checkbox label='Full screen laptop/tablet' />
          <br />
        </Segment>

        <Segment className="ui padded segment">
          <Header as='h4' className="ui header">Works on...</Header>
          <Checkbox label='Touch-only devices' />
          <br />
          <Checkbox label='Keyboard & Mouse devices' />
          <br />
          <Checkbox label='GamePad devices' />
          <br />
          <Checkbox label='Telepathic mind control' />
        </Segment>

        { false &&  // Future ideas
        <Segment className="ui padded segment">
          <Header as='h4' className="ui header">Features</Header>
          <Checkbox label='Lobbies' />
          <br />
          <Checkbox label='Save Game state in cloud' />
          <br />
          <Checkbox label='Highscores' />
          <br />
          <Checkbox label='Achievements' />
          <br />
          <Checkbox label='Realtime MultiPlayer' />
          <br />
          <Checkbox label='Turn-based MultiPlayer' />
          <br />
        </Segment>
      }
      </div>
    )
  }
}