"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes

var SettingsStore = require('../../stores/SettingsStore')
var LastFMSettings = require('./LastFMSettings.jsx')

var SettingsTab = React.createClass({
  getInitialState: function(){
    return {
      settings: SettingsStore.getSettings()
    }
  },
  componentDidMount: function(){
    SettingsStore.addChangeListener(this._onSettingsStoreChange)
  },
  componentWillUnmount: function(){
    SettingsStore.removeChangeListener(this._onSettingsStoreChange)
  },
  render: function(){
    var lastFMClient = playa.lastFMClient
    return (
      <div className="settings">
        <LastFMSettings lastFMClient={lastFMClient} settings={this.state.settings}/>
      </div>
    )
  },
  _onSettingsStoreChange: function(){
    this.setState({
      settings: SettingsStore.getSettings()
    })
  }
})

module.exports = SettingsTab
