"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var moment = require('moment')
var cx = require('classnames')
require("moment-duration-format")

var PlaylistItem = React.createClass({
  propTypes: {
    isPlaying: ReactPropTypes.bool
  },
  formatTime: function(time){
    return moment.duration(time, "seconds").format("mm:ss", { trim: false })
  },  
  renderTracklist: function(){
    return (
      <ul className="list-unstyled tracklist">
      { this.props.album.tracks.map( (track, index) => this.renderTrack(track, index) )}
      </ul>
    )
  },
  renderTrack: function(track, index){
    return (
      <li className="track" key={track.id}>
        <span className="track-number">{ track.metadata.track }.</span>
        <span className="track-title">{ track.metadata.title }</span>
      </li>
    )
  },
  render: function() {
    var classes = cx({
      'album' : true,
      'playing' : this.props.isPlaying,
      'selected'  : this.props.isSelected,
      'open': this.props.isOpened
    })
    return (
      <div className={classes} onClick={this.onClick} onDoubleClick={this.onDoubleClick}>
        <header>
          <span className="artist">{this.props.metadata.artist}</span><br/>
          <span className="title">{this.props.album.title} { this.props.isPlaying ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
          <span className="date">{this.props.metadata.date}</span>
        </header>
        { this.props.isOpened ? this.renderTracklist() : null }
      </div>
    )
  },
  onDoubleClick: function(){
    this.props.onDoubleClick(this)
  },
  onClick: function(event){
    this.props.onClick(event, this)
  }
})

module.exports = PlaylistItem