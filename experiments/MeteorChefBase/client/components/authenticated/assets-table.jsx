AssetsTable = React.createClass({
  render() {
    return (
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
          <tr>
            <th>Asset Name</th>
            <th>Asset Content</th>
          </tr>
          </thead>
          <tbody>
          {this.props.assets.map( ( asset, index ) => {
            return <AssetItem key={index} asset={asset} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});
