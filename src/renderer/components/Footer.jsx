"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var Footer = React.createClass({
  render: function() {
    var iconClasses = cx({
      'fa' : true,
      'fa-fw' : true,
      'fa-list': this.props.selectedPlaylist.displayMode == 'albums',
      'fa-th-list' : this.props.selectedPlaylist.displayMode != 'albums'
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
    return (this.props.selectedPlaylist && this.props.selectedPlaylist.items) ? this.props.selectedPlaylist.items.length + " items." : ''
  },
  handleViewSwitchClick: function(event){
    this.props.handleViewSwitchClick(this)
  }
})

module.exports = Footer