"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var moment = require('moment')
var cx = require('classnames')
require("moment-duration-format")

var PlaylistItem = React.createClass({
  propTypes: {
    metadata: ReactPropTypes.object.isRequired
  },
  formatTime: function(time){
    return moment.duration(time, "seconds").format("mm:ss", { trim: false })
  },  
  render: function() {
    var itemClasses = cx({
      'playing' : this.props.isPlaying
    })
    return (
      <tr onDoubleClick={this.onDoubleClick} onClick={this.onClick} className={itemClasses}>
        <td className="text-center">{ this.props.isPlaying ? <i className="fa fa-fw fa-volume-up"></i> : null}</td>
        <td className="text-center">{ this.props.metadata.track }</td>
        <td className="text-nowrap">{ this.props.metadata.artist }</td>
        <td className="text-nowrap">{ this.props.metadata.album }</td>
        <td className="text-nowrap">{ this.props.metadata.title }</td>
        <td className="text-center">{ this.formatTime(this.props.duration) }</td>
        <td className="text-center">{ this.props.metadata.date }</td>
      </tr>
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