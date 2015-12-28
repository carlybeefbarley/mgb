import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Plans} from '../../schemas';
import Spinner from '../../components/Spinner/Spinner';
import PlanCard from '../../components/Plans/PlanCard.js';
import PlanDetails from '../../components/Plans/PlanDetails.js';
import EditPlan from '../../components/Plans/EditPlan.js';
import styles from './view.css';
import {Link} from 'react-router';

@reactMixin.decorate(ReactMeteorData)
export default class PlanViewRoute extends Component {

  static propTypes = {
    params: PropTypes.object,
    query: PropTypes.object
  }

  getMeteorData() {
    let handle = Meteor.subscribe("plans");
    return {
      plan: Plans.findOne(this.props.params.planId),
      loading: !handle.ready()
    };
  }

  render() {
    if (this.data.loading) {
      return (<div className={styles.wrapper}><Spinner /></div>);
    }

    const plan = this.data.plan;
    if (!plan) {
      return (
        <div className={styles.wrapper}>No plan found at this address</div>
      );
    }

    const {title, createdBy} = plan;

    //Edit params?
    const { query } = this.props.location
    const edit = query && query.edit == "true"

    //Does user own plan?
    let isUser = false;
    if (this.props.currUser) {
      isUser = createdBy == this.props.currUser._id
    }

    //Wants to edit and owns plan
    if (edit && isUser) {
      return (
        <EditPlan plan={plan} />
      )
    }

    //Wants to edit but doesn't own plan
    if (edit) {
      return (
        <div className={styles.wrapper}>You don't have permission to edit {title} plan.</div>
      )
    }

    return (
      <div className={styles.wrapper}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.grid}>
          <div className={styles.column}>
            <PlanCard plan={plan} />
          </div>
          <div className={styles.column}>
            <h3 className={styles.subtitle}>More details</h3>
            <PlanDetails plan={plan} />
            {isUser ?
             <Link to={`/plan/${this.props.params.planId}`} query={{ edit: true }}  >
               <button className={styles.btn}>Edit Plan</button>
             </Link>
             : null }
          </div>
        </div>
      </div>
    );
  }
}
