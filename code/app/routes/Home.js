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
              <h1 className={styles.white}>MyGameBuilder v2</h1>
              <h3 className={styles.white}>Make Games. Make Friends. Have Fun.</h3>
              <Link to="/docs"><button className={styles.primary}>Docs</button></Link>
              <a href="http://mygamebuilder.com"><button className={styles.primary}>MGB</button></a>
            </div>
          </div>
        </div>
        <div className={styles.section2}>
          <h2 className={styles.title}>Why Use It</h2>
          <div className={styles.listGrid}>
            <div className={styles.listColumn}>
              <span className={styles.icon}><Icon size="1em" icon="check" /></span>
              <h4>Get a running start</h4>
              <p>Blah Blah Blah Blah Blah Blah Blah Blah.</p>
            </div>
            <div className={styles.listColumn}>
              <span className={styles.icon}><Icon size="1em" icon="check" /></span>
              <h4>Find friends to learn with</h4>
              <p>Blah Blah Blah Blah Blah Blah Blah Blah.</p>
            </div>
            <div className={styles.listColumn}>
              <span className={styles.icon}><Icon size="1em" icon="check" /></span>
              <h4>Get help when stuck and pay it forwards</h4>
              <p>Blah Blah Blah Blah Blah Blah.</p>
            </div>
            <div className={styles.listColumn}>
              <span className={styles.icon}><Icon size="1em" icon="check" /></span>
              <h4>Play games</h4>
              <p>Blah Blah Blah Blah Blah Blah.</p>
            </div>
          </div>
        </div>

        <div className={styles.section2}>
          <h2 className={styles.title}>Will it meet my needs?</h2>
          <div className={styles.listGrid}>
            <div className={styles.listColumn}>
              <h4>Features</h4>
              <ul className={styles.listUl}>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Online Image Editing</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Collaborative game development</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Users, Teams and Orgs</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Pro plans for advanced features and extra help</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Manage your games users communities</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Dashboard view of status and activity</li>
              </ul>
            </div>
            <div className={styles.listColumn}>
              <h4>Teams</h4>
              <ul className={styles.listUl}>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>User accounts are always free, teams/orgs have to pay</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Users can belong to many teams</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>People in orgs want to manage User roles</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>Teams have dashboards to manage things</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>...</li>
                <li className={styles.list}><span className={styles.iconList}><Icon size="1em" icon="check" /> </span>...</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.section2}>
          <h2 className={styles.title}>More...</h2>
          <div className={styles.listGrid}>
            <div className={styles.listColumn}>
              <span className={styles.iconBlue}><i className="fa fa-clone"></i></span>
              <h4>Very open to feedback</h4>
              <p>Please shoot me an email or submit a pull request. Would love anything to make this project better.</p>
            </div>
            <div className={styles.listColumn}>
              <span className={styles.iconBlue}><i className="fa fa-user"></i></span>
              <h4>Specific areas to improve</h4>
              <p>I'd like SSR to work. I messed with it a bit, but haven't got it working. Also, google's oauth is causing
              some trouble. FB and twitter work fine but I've had no luck with google. I also think a component that allows
              users to invite people from their gmail contact list would be great.</p>
            </div>
            <div className={styles.listColumn}>
              <span className={styles.iconBlue}><i className="fa fa-lock"></i></span>
              <h4>Current status</h4>
              <p>This is a learning project for me in both react and meteor. I've just started freelancing a few months back and I'm currently looking for more work. =) Please shoot
              me an email below if you'd like to get in touch. I can prototype your next SaaS app quickly.</p>
            </div>
            <div className={styles.listColumn}>
              <span className={styles.iconBlue}><i className="fa fa-share-square-o"></i></span>
              <h4>General idea</h4>
              <p>The todo portion of the app will be replaced by your actual app. However, instead of writing the team/users/payments/dashboards from scratch, you have a base to start from. </p>
            </div>
          </div>
          <p><em>Last thing - reset password option fake generates an email in your console that you can only see when you run locally at the moment. No real email is sent. While the token pass reset works, you'll have to finish setting up email with Meteor and Mailgun/Mandrill or something of the like.</em></p>
          <br/>
          <div className={styles.center}>
            <h3>Take it for a spin!</h3>
            <Link to="/join"><button className={styles.primary}>Sign up now</button></Link>
          </div>
        </div>

        <div className={styles.section3}>
          <div className={styles.heroGrid}>
            <div className={styles.heroColumn}>
              <h2>Some extra header placeholder</h2>
              <Mailto email="foobar@gmail.com" obfuscate={true}><button className={styles.primary}>Shoot me a fake email</button></Mailto>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
