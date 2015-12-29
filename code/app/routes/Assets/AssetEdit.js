import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Azzets} from '../../schemas';
import Spinner from '../../components/Spinner/Spinner';
import styles from './list.css';
import {handleForms} from '../../components/Forms/FormDecorator';
import Helmet from 'react-helmet';
import AssetEdit from '../../components/Assets/AssetEdit';
import UserItem from '../../components/Users/UserItem.js';

@handleForms
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
    this.handleSubmit = this.handleSubmit.bind(this);
    this.listenForEnter = this.listenForEnter.bind(this);
    this.state = {
      shakeBtn: false,
      formError: '',
      formSuccess: ''
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
    //list of assets provided via getMeteorData()
    let asset = this.data.asset;
    if (!asset) return null;

    //asset form setup
    let values = this.props.inputState.values;
    let errors = this.props.inputState.errors;
    let inputsToUse = [
      "name",
      "kind",
      "text"      // [TODO:DGOLDS] change to content
    ];

    const {currUser, ownsProfile} = this.props;
    const {_id, createdAt} = currUser;
    const {name, avatar} = currUser.profile;

    return (
      <div className={styles.wrapper}>

        <Helmet
          title="Asset Editor"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />

        <h1 className={styles.title}>{asset.name}</h1>

        <div className={styles.grid}>
          <div className={styles.column}>
            {asset ? <AssetEdit asset={asset}/> : null }
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

  componentDidMount() {
    window.onkeydown = this.listenForEnter;
  }

  listenForEnter(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      this.handleSubmit(e, this.props.inputState.errors, this.props.inputState.values);
    }
  }

  handleSubmit(event, errors, values) {
    event.preventDefault();

    //don't submit if there's errors showing
    //underscore method to ensure all errors are empty strings
    let errorValues = _.values(errors);
    if (! _.every(errorValues, function(str){ return str === ''; })) {
      this.setState({
        shakeBtn: true
      });
      window.setTimeout(() => {
        this.setState({
          shakeBtn: false
        });
      }, 3000);
      return false;
    }

    const {text, name, kind} = values;

    //Don't submit if required fields aren't filled out
    let requiredValues = [text, name, kind];
    if (_.some(requiredValues, function(str){ return str == undefined || str == ''; })) {
      this.setState({
        shakeBtn: true
      });
      window.setTimeout(() => {
        this.setState({
          shakeBtn: false
        });
      }, 3000);
      return false;
    }

    Meteor.call('Azzets.create', {
      name: name,
      kind: kind,
      text: text,

      isCompleted: false,
      isDeleted: false,
      isPrivate: true,
      teamId: ''
    }, (error) => {
      if (error) {
        console.log("fooooool");

        this.setState({
          formError: error.reason,
          shakeBtn: true
        });
        window.setTimeout(() => {
          this.setState({
            shakeBtn: false
          });
        }, 1000);
        return;
      } else {
        //resets form
        this.props.setDefaultValues({
          text: '',
          isCompleted: false,
          isDeleted: false
        });
      }
    });
  }

}
