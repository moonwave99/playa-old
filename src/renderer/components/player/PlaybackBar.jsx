"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')
var moment = require('moment')
require("moment-duration-format")

var PlayerStore = require('../../stores/PlayerStore')
var PlayerActions = require('../../actions/PlayerActions')

function getPlayerState(){
  return PlayerStore.getPlaybackInfo()
}

module.exports = React.createClass({
  getInitialState: function(){
    return getPlayerState()
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
    this.state.playing ? PlayerActions.pause() : PlayerActions.play()
  },
  componentDidMount: function(){
    PlayerStore.addChangeListener(this._onPlayerChange)
  },
  componentWillUnmount: function(){
    PlayerStore.removeChangeListener(this._onPlayerChange)
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
          <div className="progress-area" onClick={this.handleProgressAreaClick}>
            <progress value={this.state.currentTime} max={this.state.totalTime}></progress>
          </div>
        </div>
        <div className="playback-filter"></div>
      </div>      
    )
  },
  handleProgressAreaClick: function(event){
    var bounds = event.target.getBoundingClientRect()
    PlayerActions.seek((event.clientX - bounds.left) / bounds.width)
  },
  _onPlayerChange: function(){
    this.setState(getPlayerState())
  }  
})