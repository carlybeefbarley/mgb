AssetKindSelector = React.createClass({
  render() {

    var kindSelectors = [];
    for (var i = 0; i < AssetKinds.length; i++) {
      kindSelectors.push(<span className='indent'>{AssetKinds[i].label} </span>);
    }
    return (
      <span>{kindSelectors}</span>
    );
  }
});
