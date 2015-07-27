"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

module.exports = React.createClass({
  componentDidUpdate: function(prevProps){
    if(!this.props.currentTrack){
      this.updateWaveform(null)
    }else if(this.props.currentTrack && (!prevProps.currentTrack || prevProps.currentTrack.id !== this.props.currentTrack.id)){
      this.updateWaveform(null)
      playa.waveformLoader.load(this.props.currentTrack)
        .then(this.updateWaveform)
        .catch((err)=>{
          console.error(err, err.stack)
        })
    }
  },
  render: function(){
    var percent = 100 - this.props.currentTime / this.props.totalTime * 100
    var waveformProgressStyle = {
      'width': percent + '%'
    }
    return (
      <div className="progress-wrapper" onMouseEnter={this.handleMouseEnter} onMouseMove={this.handleMouseMove} onMouseLeave={this.handleMouseOut} onClick={this.handleClick}>
        <div className="waveform" ref="waveform"></div>
        <div className="waveform-progress" ref="waveformProgress" style={waveformProgressStyle}></div>
        <div className="progress-cursor" ref="cursor"></div>
        <progress value={this.props.currentTime} max={this.props.totalTime}></progress>
      </div>
    )
  },
  handleMouseEnter: function(event){
    React.findDOMNode(this.refs.cursor).style.opacity = '1'
  },
  handleMouseOut: function(event){
    React.findDOMNode(this.refs.cursor).style.opacity = '0'
  },
  handleClick: function(event){
    var bounds = event.currentTarget.getBoundingClientRect()
    var position = (event.clientX - bounds.left) / bounds.width
    this.props.seekTo(position)
  },
  handleMouseMove: function(event){
    var waveformBounds = event.currentTarget.getBoundingClientRect()
    var percent = (event.clientX - waveformBounds.left)/waveformBounds.width*100
    React.findDOMNode(this.refs.cursor).style.left = percent + '%'
  },
  updateWaveform: function(waveform){
    var wrapper = React.findDOMNode(this.refs.waveform)
    if(waveform){
      wrapper.style.backgroundImage = "url('file://" + encodeURI(waveform) + "')"
      wrapper.classList.add('loaded')
    }else{
      wrapper.classList.remove('loaded')
    }
  }
})
