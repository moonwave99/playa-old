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
    var current = this.props.playbackInfo.currentItem
    var total = 0
    var timeProgress = this.props.playbackInfo.position
    var remaining = 0
    if(current){
      metadata = current.file.metadata()
      total = current.file.duration()
      remaining = Math.floor(total - timeProgress)
    }else{
      metadata = {}
    }
    return <div>
      <button onClick={this.prev}>Prev</button>
      <button onClick={this.play}>{this.state.playing ? 'Pause' : 'Play' }</button>
      <button onClick={this.next}>Next</button>
      { metadata.artist } - { metadata.title }
      <span className="time-progress">{moment.duration(timeProgress, "seconds").format("mm:ss", { trim: false })}</span>
      <progress value={this.state.currentPosition} max={total}></progress>
      <span className="time-remaining">-{moment.duration(remaining, "seconds").format("mm:ss", { trim: false })}</span>
    </div>
  }
})