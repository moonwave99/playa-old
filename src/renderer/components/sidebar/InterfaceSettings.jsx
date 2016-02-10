"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes

var SettingsActions = require('../../actions/SettingsActions')

var InterfaceSettings = React.createClass({
  getInitialState: function(){
    return {
      openSidebar: this.props.settings.user.openSidebar
    }
  },
  render: function(){
    return (
      <form className="settings-block">
        <h2><i className="fa fa-fw fa-mouse-pointer"></i> Interface</h2>
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={this.state.openSidebar} onChange={this.handleSidebarChange}/> Leave Sidebar open on wide screens
          </label>
        </div>
      </form>
    )
  },
  handleSidebarChange: function(event){
    SettingsActions.set('user', 'openSidebar', !this.state.openSidebar)
    this.setState({
      openSidebar: !this.state.openSidebar
    })
  }

})

module.exports = InterfaceSettings
