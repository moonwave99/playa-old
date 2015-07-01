"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var moment = require('moment')
var cx = require('classnames')
require("moment-duration-format")

var PlaylistItem = React.createClass({
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
    var isPlaying = track.id == this.props.currentItem.id
    var classes = cx({
      'track' : true,
      'playing' : isPlaying
    })    
    return (
      <li className={classes} key={track.id} onDoubleClick={this.handleTracklistDoubleClick} data-id={track.id}>
        <span className="track-playing-indicator">{ isPlaying ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
        <span className="track-number">{ track.metadata.track }.</span>
        <span className="track-title">{ track.metadata.title }</span>
        <span className="track-duration">{ this.formatTime(track.duration) }</span>
      </li>
    )
  },
  render: function() {
    var isPlaying = !!(this.props.album.tracks.filter((i)=>{ return i.id == this.props.currentItem.id }).length)    
    var classes = cx({
      'album' : true,
      'playing' : isPlaying,
      'selected'  : this.props.isSelected,
      'open': this.props.isOpened
    })
    return (
      <div className={classes} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick} data-id={this.props.album.id}>
        <header>
          <span className="artist">{this.props.metadata.artist}</span><br/>
          <span className="title">{this.props.album.title} { (isPlaying && !this.props.isOpened) ? <i className="fa fa-fw fa-volume-up"></i> : null }</span>
          <span className="date">{this.props.metadata.date}</span>
        </header>
        { this.props.isOpened ? this.renderTracklist() : null }
      </div>
    )
  },
  handleTracklistDoubleClick: function(event){
    event.stopPropagation()
    this.props.handleDoubleClick(event.target.dataset.id)
  },
  handleDoubleClick: function(event){
    this.props.handleDoubleClick(this.props.album.tracks[0].id)
  },
  handleClick: function(event){
    this.props.handleClick(event, this)
  }
})

module.exports = PlaylistItem