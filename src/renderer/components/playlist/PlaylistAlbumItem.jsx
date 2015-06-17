"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var moment = require('moment')
var cx = require('classnames')
require("moment-duration-format")

var PlaylistItem = React.createClass({
  propTypes: {
    
  },
  formatTime: function(time){
    return moment.duration(time, "seconds").format("mm:ss", { trim: false })
  },  
  render: function() {
    var classes = cx({
      'album' : true
    })
    return (
      <div className={classes}>
        <span className="artist">{this.props.metadata.artist}</span><br/>
        <span className="title">{this.props.metadata.title}</span>
        <span className="date">{this.props.metadata.date}</span>
      </div>
    )
  },
  onDoubleClick: function(){
    this.props.onDoubleClick(this)
  },
  onClick: function(){
    this.props.onClick(this)
  }
})

module.exports = PlaylistItem