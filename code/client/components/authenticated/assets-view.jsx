
// We are using https://atmospherejs.com/universe/react-table
import {Table, Thead, Th} from '{universe:react-table}';

AssetsView = React.createClass({

  mixins: [ ReactMeteorData ],

  getMeteorData() {
    let subscription = Meteor.subscribe( 'assets' );

    return {
      isLoading: !subscription.ready(),
      assets: AssetsCollection.find().fetch()
    };
  },

  getInitialState() {
    var _tagsToShow = {};
    _.each(Object.keys(AssetKinds), (k) => { _tagsToShow[k] = true; });
    return { tagsToShow : _tagsToShow }
  },

  _tagsChangedHandler : function(assetKey) {
    this.state.tagsToShow[assetKey] = !this.state.tagsToShow[assetKey];   // TODO: find a safer way to do this React-ily - see See http://facebook.github.io/react/docs/update.html
    this.setState( { tagsToShow : this.state.tagsToShow } );              // TODO: ^^^
  },

  _filterAssetsBySelectedTags(assetsList) {
    return _.filter(assetsList, (a) => {return this.state.tagsToShow[a.kind] === true })
  },

  render() {

    return (

      <div className="jumbotron text-center" style={{padding: '20px'}}>
        <h2>Assets</h2>
        <AssetKindSelector tagsToShow={this.state.tagsToShow} tagsChangedCallback={this._tagsChangedHandler}/>
        <Table
          className="table"
          onClickRow={(item, i, e) => alert('clicked on row:' +  item + i + e)}
          itemsPerPage={10} pageButtonLimit={6}
          sortable={true}
          filterable={['name']}
          data={this._filterAssetsBySelectedTags(this.data.assets)}>
          <Thead>
            <Th column="name">
              <strong className="asset-name-header">Asset Name</strong>
            </Th>
            <Th column="kind">
              <em className="asset-kind-header">Asset Kind</em>
            </Th>
            <Th column="content">
              <em className="asset-content-header">Asset Content</em>
            </Th>
          </Thead>
        </Table>
      </div>
    );
  }
});
