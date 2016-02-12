"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes

var InterfaceSettings = require('./InterfaceSettings.jsx')
var PlaylistSettings = require('./PlaylistSettings.jsx')
var FolderSettings = require('./FolderSettings.jsx')
var LastFMSettings = require('./LastFMSettings.jsx')
var RemoteSettings = require('./RemoteSettings.jsx')

var SettingsTab = React.createClass({
  render: function(){
    var lastFMClient = playa.lastFMClient
    return (
      <div className="settings">
        <InterfaceSettings settings={this.props.settings}/>
        <PlaylistSettings settings={this.props.settings}/>
        <FolderSettings settings={this.props.settings}/>
        <LastFMSettings lastFMClient={lastFMClient} settings={this.props.settings}/>
        <RemoteSettings settings={this.props.settings}/>
      </div>
    )
  }
})

module.exports = SettingsTab
