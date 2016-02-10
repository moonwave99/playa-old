"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')
var moment = require('moment')
require("moment-duration-format")

var AlbumTracklistItem = React.createClass({
  propTypes: {

  },
  formatTime: function(time){
    return moment.duration(time, "seconds").format("mm:ss", { trim: false })
  },
  renderTrackTitle: function(track){
    var track = this.props.track
    if(track.disabled){
        return <span className="track-filename">{track.filename}</span>
    }else if(this.props.album.getArtistCount() > 1){
      return (
        <span className="track-title">
          <span className="track-artist">{track.metadata.artist}</span>
          <span className="separator"></span>
          <span>{track.metadata.title}</span>
        </span>
      )
    }else{
      return <span className="track-title">{track.metadata.title}</span>
    }
  },
  render: function(){
    var track = this.props.track
    var even = this.props.index % 2 == 0
    var classes = cx({
      'track'     : true,
      'playing'   : this.props.isPlaying,
      'selected'  : this.props.isSelected,
      'odd'       : !even,
      'even'      : even,
      'disabled'  : this.props.track.disabled
    })
    return (
      <li className={classes} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick} data-id={track.id}>
        <span className="track-playing-indicator">{ this.props.isPlaying ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
        <span className="track-number">{ track.metadata.track }.</span>
        { this.renderTrackTitle() }
        <span className="track-duration sidebar-offset">{ this.formatTime(track.duration) }</span>
      </li>
    )
  },
  handleClick: function(event){
    this.props.handleClick(event, this)
  },
  handleDoubleClick: function(event){
    this.props.handleDoubleClick(event, this)
  }
})

module.exports = AlbumTracklistItem
