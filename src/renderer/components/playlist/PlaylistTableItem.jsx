"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var moment = require('moment')
var cx = require('classnames')
require("moment-duration-format")

var PlaylistItem = React.createClass({
  propTypes: {
    metadata: ReactPropTypes.object.isRequired,
    duration: ReactPropTypes.number.isRequired
  },
  formatTime: function(time){
    return moment.duration(time, "seconds").format("mm:ss", { trim: false })
  },  
  render: function() {
    var itemClasses = cx({
      'playing'   : this.props.isPlaying,
      'selected'  : this.props.isSelected
    })
    return (
      <tr onDoubleClick={this.handleDoubleClick} onClick={this.handleClick} className={itemClasses} data-id={this.props.itemKey}>
        <td className="text-center">{ this.props.isPlaying ? <i className="fa fa-fw fa-volume-up"></i> : null }</td>
        <td className="text-center">{ this.props.metadata.track }</td>
        <td className="text-nowrap">{ this.props.metadata.artist }</td>
        <td className="text-nowrap">{ this.props.metadata.album }</td>
        <td className="text-nowrap">{ this.props.metadata.title }</td>
        <td className="text-center">{ this.formatTime(this.props.duration) }</td>
        <td className="text-center">{ this.props.metadata.year }</td>
      </tr>
    )
  },
  handleDoubleClick: function(){
    this.props.handleDoubleClick(this)
  },
  handleClick: function(event){
    this.props.handleClick(event, this)
  }
})

module.exports = PlaylistItem