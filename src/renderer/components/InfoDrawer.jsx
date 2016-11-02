"use babel"

var _ = require('lodash')
var ipc = require('electron').ipcRenderer
var path = require('path')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var OpenPlaylistActions = require('../actions/OpenPlaylistActions')
var AudioMetadata = require('../util/AudioMetadata')

var InfoDrawer = React.createClass({
  componentWillReceiveProps: function(nextProps){
    let currentTrack = playa.player.currentTrack
    if(!currentTrack){
      return
    }
    let metadata = new AudioMetadata(currentTrack.filename)
    metadata.load().then(()=>{
      this.setState({
        audioInfo: metadata.toJSON()
      })
    })
  },
  getInitialState: function(){
    return {
      audioInfo: null
    }
  },
  renderCurrentTrackInfo: function(){
    return (
      <ul className="list-unstyled track-info">
        { _.map(this.state.audioInfo, (value, key)=>{
          return <li key={key}><span className="key">{key.replace('_', ' ')}:</span><span className="value">{value}</span></li>
        })}
      </ul>
    )
  },
  render: function() {
    let info = playa.player.playbackInfo()
    let classes = cx({
      'info-drawer' : true
    })
    return (
      <div className={classes}><h3>Now Playing</h3>{ this.state.audioInfo ? this.renderCurrentTrackInfo() : <p>Seems like you are enjoying the silence now.</p> }</div>
    )
  }
})

module.exports = InfoDrawer
