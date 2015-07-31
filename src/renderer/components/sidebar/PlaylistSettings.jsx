"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes

var SettingsActions = require('../../actions/SettingsActions')

var PlaylistSettings = React.createClass({
  getInitialState: function(){
    return {
      autosave: this.props.settings.user.autosave
    }
  },
  render: function(){
    return (
      <form className="settings-block">
        <h2><i className="fa fa-fw fa-file-audio-o"></i> Playlists</h2>
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={this.state.autosave} onChange={this.handleAutosaveChange}/> Autosave
          </label>
        </div>
      </form>
    )
  },
  handleAutosaveChange: function(event){
    SettingsActions.set('user', 'autosave', !this.state.autosave)
    this.setState({
      autosave: !this.state.autosave
    })
  }

})

module.exports = PlaylistSettings
