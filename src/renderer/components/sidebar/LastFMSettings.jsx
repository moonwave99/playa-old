"use babel"

var _ = require('lodash')
var cx = require('classnames')
var shell = require('shell')
var React = require('react')
var ReactPropTypes = React.PropTypes

var SettingsActions = require('../../actions/SettingsActions')

var LastFMSettings = React.createClass({
  getInitialState: function(){
    return {
      scrobbleEnabled: this.props.settings.user.scrobbleEnabled,
      isAuthorised: this.props.lastFMClient.isAuthorised()
    }
  },
  componentDidMount: function(){
    playa.lastFMClient.on('authorised', this._onLastFMCLientAuthorisationChange)
    playa.lastFMClient.on('signout', this._onLastFMCLientAuthorisationChange)
  },
  componentWillUnmount: function(){
    playa.lastFMClient.removeListener('authorised', this._onLastFMCLientAuthorisationChange)
    playa.lastFMClient.removeListener('signout', this._onLastFMCLientAuthorisationChange)
  },
  render: function(){
    return (
      <form className="settings-block">
        <h2><i className="fa fa-fw fa-lastfm"></i> Last.fm</h2>
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={this.state.scrobbleEnabled} onChange={this.handleScrobbleChange}/> Enable scrobbling
          </label>
        </div>
        { this.renderUserInfo() }
      </form>
    )
  },
  renderUserInfo: function(){
    if(this.state.isAuthorised){
      return (
        <div>
          <p>Signed in as: <a href="#" onClick={this.handleLastFMUserClick} title="Visit Last.FM profile"><strong>{this.props.lastFMClient.session.user}</strong></a></p>
          <p><a className="btn btn-default btn-sm btn-block" href="#" onClick={this.handleSignoutClick}><i className="fa fa-sign-out"></i> Sign out</a></p>
        </div>
      )
    }else{
      return (
        <a className="btn btn-default btn-sm btn-block" href="#" onClick={this.handleAuthoriseClick}><i className="fa fa-sign-in"></i> Authorise Playa</a>
      )
    }
  },
  handleLastFMUserClick: function(event){
    shell.openExternal('https://last.fm/user/' + this.props.lastFMClient.session.user)
  },
  handleAuthoriseClick: function(event){
    this.props.lastFMClient.authorise()
  },
  handleSignoutClick: function(event){
    this.props.lastFMClient.signout()
  },
  handleScrobbleChange: function(event){
    SettingsActions.set('user', 'scrobbleEnabled', !this.state.scrobbleEnabled)
    this.setState({
      scrobbleEnabled: !this.state.scrobbleEnabled
    })
  },
  _onLastFMCLientAuthorisationChange: function(){
    this.setState({
      isAuthorised: this.props.lastFMClient.isAuthorised()
    })
  }
})

module.exports = LastFMSettings
