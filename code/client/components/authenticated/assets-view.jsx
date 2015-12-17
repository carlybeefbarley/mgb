
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

  render() {
    return (

      <div className="jumbotron text-center" style={{padding: '20px'}}>
        <h2>Assets</h2>
        <Table
          className="table"
          onClickRow={(item, i, e) => alert('clicked on row:' +  item + i + e)}
          itemsPerPage={3} pageButtonLimit={6}
          sortable={true}
          filterable={['name']}
          data={this.data.assets}>
          <Thead>
            <Th column="name">
              <strong className="name-header">Asset Name</strong>
            </Th>
            <Th column="content">
              <em className="age-header">Asset Content</em>
            </Th>
          </Thead>
        </Table>
        <AssetsTable assets={this.data.assets} />
      </div>
    );
  }
});
