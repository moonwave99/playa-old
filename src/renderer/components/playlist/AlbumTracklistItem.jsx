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
    if(this.props.album.getArtistCount() > 1){
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
    var classes = cx({
      'track'     : true,
      'playing'   : this.props.isPlaying,
      'selected'  : this.props.selected
    })
    return (
      <li className={classes} onDoubleClick={this.handleDoubleClick} data-id={track.id}>
        <span className="track-playing-indicator">{ this.props.isPlaying ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
        <span className="track-number">{ track.metadata.track }.</span>
        { this.renderTrackTitle() }
        <span className="track-duration">{ this.formatTime(track.duration) }</span>
      </li>
    )
  },
  handleDoubleClick: function(event){
    this.props.handleDoubleClick(event, this)
  }
})

module.exports = AlbumTracklistItem
