"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')
var moment = require('moment')
require("moment-duration-format")

var PlayerActions = require('../../actions/PlayerActions')

module.exports = React.createClass({
  propTypes: {
    playbackInfo: ReactPropTypes.object
  },
  getInitialState: function(){
    return {
      duration: 0,
      currentTime: 0,
      remainingTime: 0,
      playing: false,
      hideInfo: true,
      metadata: {},
      filename: null
    }
  },
  formatTime: function(time){
    return moment.duration(time, "seconds").format("mm:ss", { trim: false })
  },
  prev: function(){
    PlayerActions.prev()
  },
  next: function(){
    PlayerActions.next()
  },
  play: function(event){
    (this.props.playbackInfo && this.props.playbackInfo.playing) ? PlayerActions.pause() : PlayerActions.play()
  },
  componentWillReceiveProps: function(nextProps){
    var info = nextProps.playbackInfo
    var totalTime = info.item.duration
    var currentTime = Math.round(info.position) || 0
    this.setState({
      totalTime: totalTime,
      currentTime: currentTime,
      remainingTime: totalTime - currentTime,
      playing: !!info.playing,      
      hideInfo: !info.item.duration,
      metadata: info.item.metadata || {},
      filename: info.item.filename || null
    })    
  },
  render: function() {    
    var wrapperClasses = cx({
      'playback-track-info-wrapper' : true,
      'hide-info' : this.state.hideInfo
    })
    return (
      <div className="playback-bar">
        <div className="playback-buttons">
          <button onClick={this.prev}><i className="fa fa-fw fa-backward"></i></button>
          <button onClick={this.play}>{this.state.playing ? <i className="fa fa-fw fa-pause"></i> : <i className="fa fa-fw fa-play"></i>}</button>
          <button onClick={this.next}><i className="fa fa-fw fa-forward"></i></button>
        </div>
        <div className={wrapperClasses}>
          <span className="playback-time-indicator time-progress">{this.formatTime(this.state.currentTime)}</span>
          <div className="playback-track-info">
            <span className="playback-track-info-title">{ this.state.metadata.title }</span>
            <span className="playback-track-info-artist">{ this.state.metadata.artist } - { this.state.metadata.album }</span>
          </div>
          <span className="playback-time-indicator time-remaining">-{this.formatTime(this.state.remainingTime)}</span>
          <div className="waveform" ref="waveform"></div>
          <div className="progress-area" onClick={this.onProgressAreaClick}>
            <progress value={this.state.currentTime} max={this.state.totalTime}></progress>
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