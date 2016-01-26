import React, {Component} from 'react';
import Mailto from 'react-mailto';
import styles from './home.css';
import Icon from '../components/Icons/Icon';
import {Link} from 'react-router';

export default class Home extends Component {

  render() {
    return (
      <div>
        <div className={styles.section1}>
          <div className={styles.heroGrid}>
            <div className={styles.heroColumn}>
              <h1 className={styles.s1text}>MyGameBuilder</h1>
              <h3 className={styles.s1text}>Make Games.<br></br>Make Friends.<br></br>Have Fun.</h3>
              <Link to="/docs"><button className={styles.primary}>Docs</button></Link>
              <a href="http://mygamebuilder.com"><button className={styles.primary}>MGB</button></a>
            </div>
          </div>
        </div>

        <div className={styles.section2}>
          <h2 className={styles.title}>Will it meet my needs?</h2>
          <div className={styles.listGrid}>
            <div className={styles.listColumn}>
              <h4>Features</h4>
              <ul className={styles.listUl}>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Collaborative online game development</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Pro plans for advanced features and extra help</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Track and Manage your game's user communities</li>
              </ul>
            </div>
            <div className={styles.listColumn}>
              <h4>Teams</h4>
              <ul className={styles.listUl}>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Users, Teams and Orgs</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>User accounts are always free, teams/orgs have to pay</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Users can belong to many teams</li>
              </ul>
            </div>
          </div>
          {/*** TODO
           NOTE - reset password option fake-generates an email in the console that you can only be seen when the server
           is run locally at the moment. No real email is sent. While the token pass reset works, [TODO] we have to
           finish setting up email with Meteor and Mailgun/Mandrill or something of the like.
           ***/}
        </div>
      </div>
    );
  }
}
