"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var Footer = React.createClass({
  render: function() {
    var iconClasses = cx({
      'fa' : true,
      'fa-fw' : true,
      'fa-list': this.props.selectedPlaylist.getDisplayMode() == 'albums',
      'fa-th-list' : this.props.selectedPlaylist.getDisplayMode() != 'albums'
    })
    return (
      <footer className="footer">
        <span className="count">{this.playlistDescription()}</span>
        <ul className="list-unstyled pull-right icons">
          <li><a href="#" onClick={this.handleViewSwitchClick}><i className={iconClasses}></i></a></li>
        </ul>
      </footer>
    )
  },
  playlistDescription: function(){
    var itemsLength = this.props.selectedPlaylist ? this.props.selectedPlaylist.getItems().length : null
    return itemsLength ? itemsLength + " albums." : ''
  },
  handleViewSwitchClick: function(event){
    this.props.handleViewSwitchClick(this)
  }
})

module.exports = Footer