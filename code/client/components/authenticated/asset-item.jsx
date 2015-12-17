AssetItem = React.createClass({
  render() {
    return (
      <tr>
        <td>{this.props.asset.name}</td>
        <td>{this.props.asset.content}</td>
      </tr>
    );
  }
});
