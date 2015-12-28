AssetKindSelector = React.createClass({

  _toggleTag: function(i) {
    this.props.tagsChangedCallback(i);
  },

  render() {
    var kindSelectors = [];
    let assetKindKeys = Object.keys(this.props.tagsToShow);

    _.each(assetKindKeys, (k) => {
      kindSelectors.push(
        <div key={k} className={this.props.tagsToShow[k] === true ? "label label-success mgb-tag-select-button" : "label label-default mgb-tag-select-button"} onClick={this._toggleTag.bind(this,k)}>{k}&nbsp;<span className={AssetKinds[k].icon} aria-hidden="true"></span></div>
      );
    });

    return (
      <div>{kindSelectors}</div>
    );
  }
});
