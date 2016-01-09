import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';
import AssetList from '../../components/Assets/AssetList';
import Spinner from '../../components/Spinner/Spinner';
import styles from './list.css';
import {handleForms} from '../../components/Forms/FormDecorator';
import {History} from 'react-router';
import Helmet from 'react-helmet';
import UserItem from '../../components/Users/UserItem.js';
import AssetCreateNew from '../../components/Assets/AssetCreateNew.js';

@reactMixin.decorate(History)
@reactMixin.decorate(ReactMeteorData)
export default class UserAssetListRoute extends Component {

  static propTypes = {
    params: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  }

  constructor(props) {
    super(props);
  }

  getMeteorData() {
    let handle

    //Subscribe to assets labeled isPrivate?
    if (this.props.ownsProfile) {
      handle = Meteor.subscribe("assets.auth", this.props.params.id);
    } else {
      handle = Meteor.subscribe("assets.public");
    }

    return {
      assets: Azzets.find({}, {sort: {createdAt: -1}}).fetch(),
      loading: !handle.ready()
    };
  }

  render() {
    let assets = this.data.assets;    //list of assets provided via getMeteorData()

    const {user, ownsProfile} = this.props;
    const {_id, createdAt} = user;
    const {name, avatar} = user.profile;

    return (
      <div className={styles.wrapper}>
        <Helmet
          title="Assets"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <h1 className={styles.title}>{name}&rsquo;s Assets</h1>
        <h3 className={styles.subtitle}>{assets.length} Assets</h3>

        <div className={styles.grid}>
          <div className={styles.column}>

            {this.props.ownsProfile ?
              <AssetCreateNew
                handleCreateAssetClick={this.handleCreateAssetClickFromComponent.bind(this)}/>
            : null }

            {assets ?
              <AssetList assets={assets} canEdit={ownsProfile} />
            : null }
          </div>
          <div className={styles.cardColumn}>
            <UserItem
              name={name}
              avatar={avatar}
              createdAt={createdAt}
              _id={_id} />
          </div>
        </div>
      </div>
    );
  }

  handleCreateAssetClickFromComponent(assetKindKey, assetName) {
    Meteor.call('Azzets.create', {
      name: assetName,
      kind: assetKindKey,
      text: "TODO:ASSET_CONTENT",

      isCompleted: false,
      isDeleted: false,
      isPrivate: true,
      teamId: ''
    }, (error, result) => {
      if (error) {
          alert.show("cannot create asset because: " + error.reason);
      } else {
        this.history.pushState(null, `/assetEdit/${result}`)
      }
    });
  }


}
