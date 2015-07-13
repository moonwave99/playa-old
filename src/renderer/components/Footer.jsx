"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')
var moment = require('moment')
require("moment-duration-format")

var Footer = React.createClass({
  formatTime: function(time){
    return moment.duration(time, "seconds").format("hh [hours], mm [minutes and] ss [seconds]", { trim: false })
  },
  render: function() {
    var iconClasses = cx({
      'fa' : true,
      'fa-fw' : true
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
    if(!this.props.selectedPlaylist){
      return 'No playlist selected.'
    }else{
      var stats = this.props.selectedPlaylist.getStats()
      return (stats.tracks == 0)
        ? 'No tracks in this playlist yet.'
        : stats.albums + ' albums · ' + stats.tracks + ' tracks · ' + this.formatTime(stats.totalTime)
    }
  },
  handleViewSwitchClick: function(event){
    this.props.handleViewSwitchClick(this)
  }
})

module.exports = Footer
