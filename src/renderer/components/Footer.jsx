"use babel"

var React = require('react')
var ipc = require('electron').ipcRenderer
var ReactPropTypes = React.PropTypes
var cx = require('classnames')
var moment = require('moment')
require("moment-duration-format")

var InfoDrawer = require('./InfoDrawer.jsx')

var Footer = React.createClass({
  formatTime: function(time){
    return moment.duration(time, "seconds").format("hh [hours and] mm [minutes]", { trim: false })
  },
  getInitialState: function(){
    return {
      isDrawerOpen: false
    }
  },
  componentDidMount: function(){
    ipc.on('playlist:toggleInfo', this._onPlaylistInfoToggle)
  },
  componentWillUnmount: function(){
    ipc.removeListener('playlist:toggleInfo', this._onPlaylistInfoToggle)
  },
  render: function() {
    var footerClasses = cx({
      'footer'        : true,
      'isDrawerOpen'  : this.state.isDrawerOpen
    })
    var iconClasses = cx({
      'list-inline' : true,
      'pull-right'    : true,
      'icons'         : true,
      'hidden'        : !this.props.selectedPlaylist
    })
    var errorIconClasses = cx({
      'fa'                    : true,
      'fa-fw'                 : true,
      'fa-exclamation-circle' : true,
      'error-icon'            : true,
      'hidden'                : true
    })
    return (
      <footer className={footerClasses}>
        <div className="footer-top-bar">
          <span className="count">{this.playlistDescription()}</span>
          <ul className={iconClasses}>
            <li><a href="#" onClick={this.handleErrorIconClick}><i className={errorIconClasses}></i></a></li>
            <li><a href="#" onClick={this.handleInfoIconClick}><i className="fa fa-fw fa-info"></i></a></li>
          </ul>
        </div>
        <InfoDrawer {...this.props}/>
      </footer>
    )
  },
  playlistDescription: function(){
    if(!this.props.selectedPlaylist){
      return 'No playlist selected.'
    }else{
      var stats = this.props.selectedPlaylist.getStats()
      return (stats.tracks == 0)
        ? 'No tracks in this playlist yet.'
        : stats.albums + ' albums · ' + stats.tracks + ' tracks · ' + this.formatTime(stats.totalTime)
    }
  },
  handleInfoIconClick: function(event){
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    })
  },
  handleErrorIconClick: function(event){
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    })
  },
  _onPlaylistInfoToggle: function(){
    this.setState({ isDrawerOpen: !this.state.isDrawerOpen })
  }
})

module.exports = Footer
