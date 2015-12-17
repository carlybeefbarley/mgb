AssetsView = React.createClass({

  mixins: [ ReactMeteorData ],

  getMeteorData() {
    let subscription = Meteor.subscribe( 'assets' );

    return {
      isLoading: !subscription.ready(),
      assets: AssetsCollection.find().fetch()
    };
  },

  render() {
    return (
      <div className="jumbotron text-center" style={{padding: '20px'}}>
        <h2>Assets</h2>
        <AssetsTable assets={this.data.assets} />
      </div>
    );
  }
});
