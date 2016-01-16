import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';
import Spinner from '../../components/Spinner/Spinner';
import {handleForms} from '../../components/Forms/FormDecorator';
import Helmet from 'react-helmet';
import AssetEdit from '../../components/Assets/AssetEdit';
import UserItem from '../../components/Users/UserItem.js';
import {AssetKinds} from '../../schemas/assets';

@reactMixin.decorate(ReactMeteorData)
export default class AssetEditRoute extends Component {

  static propTypes = {
    params: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  getMeteorData() {
    let handle

    //Subscribe to assets labeled isPrivate?
    if (this.props.ownsProfile) {
      handle = Meteor.subscribe("assets.auth", this.props.user._id);
    } else {
      handle = Meteor.subscribe("assets.public");
    }

    return {
      asset: Azzets.findOne(this.props.params.id),
      loading: !handle.ready()
    };
  }

  render() {
    // One Asset provided via getMeteorData()
    let asset = this.data.asset;
    if (!asset) return null;

    const {currUser, ownsProfile} = this.props;
    const {_id, createdAt} = currUser;
    const {name, avatar} = currUser.profile;

    return (
      <div className="ui grid">

        <Helmet
          title="Asset Editor"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <div className="ui nine wide column">

          <div className="ui large left action input fluid">
            <div className="ui teal icon button">
              <i className={AssetKinds.getIconClass(asset.kind)}></i>

            </div>
            <input ref="assetNameInput" value={asset.name} onChange={this.handleAssetNameChangeInteractive.bind(this)}></input>
          </div>

          <div class="ui segment ">
            <p>I'm here to tell you something...</p>
          </div>

        </div>

        <div className="seven wide column">
          <UserItem
            name={name}
            avatar={avatar}
            createdAt={createdAt}
            _id={_id} />
        </div>

        <div className="sixteen wide column">
          <AssetEdit asset={asset}/>
        </div>
      </div>
    );
  }

  handleAssetNameChangeInteractive() {
    let canEdit = true; // TODO: Something based on this.props.ownsProfile ??
    Meteor.call('Azzets.update', this.data.asset._id, canEdit, {name: this.refs.assetNameInput.value}, (err, res) => {
      if (err) {
        this.props.showToast(err.reason, 'error')
      }
    });
  }



}
