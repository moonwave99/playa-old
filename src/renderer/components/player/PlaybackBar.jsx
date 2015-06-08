"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var moment = require('moment')
require("moment-duration-format")

var PlayerActions = require('../../actions/PlayerActions')

var timerId = null;

module.exports = React.createClass({
  propTypes: {
    playbackInfo: ReactPropTypes.object,
    playlist: ReactPropTypes.object
  },  
  getInitialState: function() {
    return {
      playing: false,
      currentItem: null,
      currentPosition: 0
    };
  },
  startTimer: function(){
    var timer = function(){
      return setTimeout(() =>{
        this.setState({ currentPosition: this.props.playbackInfo.position++ })
        timerId = timer()
      }, 1000)
    }.bind(this)
    timerId = timer()
  },
  stopTimer: function(){
    timerId && clearTimeout(timerId)
  },
  prev: function(){
    PlayerActions.prev()
  },
  next: function(){
    PlayerActions.next()
  },
  play: function(event){
    if(this.state.playing){
      PlayerActions.pause()  
      this.stopTimer()
    }else{
      PlayerActions.play(this.props.playlist)
      this.startTimer()
    }
    this.setState({
      playing: !this.state.playing
    })
  },
  render: function() {
    console.log(this.props.playbackInfo)
    var current = this.props.playbackInfo.currentItem
    var totalTime = 0
    var currentTime = this.props.playbackInfo.position
    var remainingTime = 0
    if(current){
      metadata = current.file.metadata()
      totalTime = Math.round(current.file.duration())
      remainingTime = Math.round(totalTime - currentTime)
    }else{
      metadata = {}
    }
    return (
      <div className="playback-bar">
        <div className="playback-buttons">
          <button onClick={this.prev}><i className="fa fa-fw fa-backward"></i></button>
          <button onClick={this.play}>{this.props.playbackInfo.playing ? <i className="fa fa-fw fa-pause"></i> : <i className="fa fa-fw fa-play"></i>}</button>
          <button onClick={this.next}><i className="fa fa-fw fa-forward"></i></button>
        </div>
        <div className="playback-track-info-wrapper">
          <span className="playback-time-indicator time-progress">{moment.duration(currentTime, "seconds").format("mm:ss", { trim: false })}</span>
          <div className="playback-track-info">
            <span className="playback-track-info-title">{ metadata.title }</span>
            <span className="playback-track-info-artist">{ metadata.artist } - { metadata.album }</span>
            <progress value={currentTime} max={totalTime} onClick={this.onProgressbarClick}></progress>
          </div>
          <span className="playback-time-indicator time-remaining">-{moment.duration(remainingTime, "seconds").format("mm:ss", { trim: false })}</span>
        </div>
      </div>      
    )
  },
  onProgressbarClick: function(event){
    var bounds = event.target.getBoundingClientRect()
    PlayerActions.seek((event.clientX - bounds.left) / bounds.width)
  }
})