"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var moment = require('moment')
var cx = require('classnames')
require("moment-duration-format")

var MetaDoctor = require('../../util/MetaDoctor')
var PlayerActions = require('../../actions/PlayerActions')

module.exports = React.createClass({
  propTypes: {
    playbackInfo: ReactPropTypes.object,
    playlist: ReactPropTypes.object
  },
  prev: function(){
    PlayerActions.prev()
  },
  next: function(){
    PlayerActions.next()
  },
  play: function(event){
    this.props.playbackInfo.playing ? PlayerActions.pause() : PlayerActions.play(this.props.playlist)
  },
  render: function() {
    var current = this.props.playbackInfo.currentItem
    var totalTime = 0
    var currentTime = this.props.playbackInfo.position
    var remainingTime = 0
    if(current){
      metadata = MetaDoctor.normalise(current.file.metadata())
      totalTime = Math.round(current.file.duration())
      remainingTime = Math.round(totalTime - currentTime)
    }else{
      metadata = {}
    }
    var wrapperClasses = cx({
      'playback-track-info-wrapper' : true,
      'hide-info' : !current
    })
    return (
      <div className="playback-bar">
        <div className="playback-buttons">
          <button onClick={this.prev}><i className="fa fa-fw fa-backward"></i></button>
          <button onClick={this.play}>{this.props.playbackInfo.playing ? <i className="fa fa-fw fa-pause"></i> : <i className="fa fa-fw fa-play"></i>}</button>
          <button onClick={this.next}><i className="fa fa-fw fa-forward"></i></button>
        </div>
        <div className={wrapperClasses}>
          <span className="playback-time-indicator time-progress">{moment.duration(currentTime, "seconds").format("mm:ss", { trim: false })}</span>
          <div className="playback-track-info">
            <span className="playback-track-info-title">{ metadata.title }</span>
            <span className="playback-track-info-artist">{ metadata.artist } - { metadata.album }</span>
          </div>
          <span className="playback-time-indicator time-remaining">-{moment.duration(remainingTime, "seconds").format("mm:ss", { trim: false })}</span>
          <div className="progress-area" onClick={this.onProgressAreaClick}>
            <progress value={currentTime} max={totalTime}></progress>
          </div>
        </div>
        <div className="playback-filter"></div>
      </div>      
    )
  },
  onProgressAreaClick: function(event){
    var bounds = event.target.getBoundingClientRect()
    PlayerActions.seek((event.clientX - bounds.left) / bounds.width)
  }
})