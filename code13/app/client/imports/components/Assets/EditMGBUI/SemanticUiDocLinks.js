import _ from 'lodash';
import React from 'react';


export default SemanticUiDocLinks = React.createClass({
  
  
  /** React callback - before render() is called */
  getInitialState: function() {
    return {
      filterString: ""       // substring to look for in list of link names
    }
  },
  
  handleFilter: function(event) {
    this.setState({ filterString: event.target.value})
  },
  
  render: function() {
    return (
      <div>
        <div className="ui input">
          <input type="text" placeholder="Filter links..."   onChange={this.handleFilter}></input>
        </div>
        <div className="ui list">
          { links.map( (link,idx) => { 
            return link.indexOf(this.state.filterString) === -1 ? null :
                    <a className="item" key={idx} href={"http://semantic-ui.com" + link} target="_blank">
                      {link}
                    </a>
          })}
        </div>
      </div>
    )
  }
})


var links = [ // version 2.1.6

  "/introduction/integrations.html",
  "/introduction/build-tools.html",
  "/introduction/advanced-usage.html",
  "/introduction/glossary.html",
  "/usage/theming.html",
  "/usage/layout.html",
  "/globals/reset.html",
  "/globals/site.html",
  "/elements/button.html",
  "/elements/container.html",
  "/elements/divider.html",
  "/elements/flag.html",
  "/elements/header.html",
  "/elements/icon.html",
  "/elements/image.html",
  "/elements/input.html",
  "/elements/label.html",
  "/elements/list.html",
  "/elements/loader.html",
  "/elements/rail.html",
  "/elements/reveal.html",
  "/elements/segment.html",
  "/elements/step.html",
  "/collections/breadcrumb.html",
  "/collections/form.html",
  "/collections/grid.html",
  "/collections/menu.html",
  "/collections/message.html",
  "/collections/table.html",
  "/views/advertisement.html",
  "/views/card.html",
  "/views/comment.html",
  "/views/feed.html",
  "/views/item.html",
  "/views/statistic.html",
  "/modules/accordion.html",
  "/modules/checkbox.html",
  "/modules/dimmer.html",
  "/modules/dropdown.html",
  "/modules/embed.html",
  "/modules/modal.html",
  "/modules/nag.html",
  "/modules/popup.html",
  "/modules/progress.html",
  "/modules/rating.html",
  "/modules/search.html",
  "/modules/shape.html",
  "/modules/sidebar.html",
  "/modules/sticky.html",
  "/modules/tab.html",
  "/modules/transition.html",
  "/behaviors/api.html",
  "/behaviors/form.html",
  "/behaviors/visibility.html"
];