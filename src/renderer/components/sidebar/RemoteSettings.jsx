"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes

var SettingsActions = require('../../actions/SettingsActions')

var RemoteSettings = React.createClass({
  getInitialState: function(){
    return {
      allowRemote: this.props.settings.user.allowRemote
    }
  },
  render: function(){
    return (
      <form className="settings-block">
        <h2><i className="fa fa-fw fa-play-circle-o"></i> Remote Control</h2>
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={this.state.allowRemote} onChange={this.handleRemoteChange}/> Allow HTTP Remote Control
          </label>
        </div>
        { this.state.allowRemote ? this.renderRemoteLink() : null }
      </form>
    )
  },
  renderRemoteLink: function(){
    let remote = playa.remote
    return <span>Address: <strong><a href="#">{remote.getAddress()}</a></strong></span>
  },
  handleRemoteChange: function(event){
    SettingsActions.set('user', 'allowRemote', !this.state.allowRemote)
    this.setState({
      allowRemote: !this.state.allowRemote
    })
    if(playa.remote.isActive()){
      playa.remote.stop()
    }else{
      playa.remote.start()
    }
  }

})

module.exports = RemoteSettings
