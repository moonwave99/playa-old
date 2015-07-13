"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var Tabs = require('react-simpletabs')
var ReactPropTypes = React.PropTypes
var PlaylistBrowserTab = require('./PlaylistBrowserTab.jsx')
var FileBrowserTab = require('./FileBrowserTab.jsx')
var SettingsTab = require('./SettingsTab.jsx')

var Sidebar = React.createClass({
  render: function() {
    var classes = cx({
      'sidebar'       : true,
      'sidebar-left'  : true,
      'open'          : this.props.isOpen
    })
    return (
      <div className={classes}>
        <Tabs
          tabActive={this.props.selectedTab+1}
          onAfterChange={this.handleAfter}>
          {this.renderTabs()}
        </Tabs>
      </div>
    )
  },
  renderTabs: function(){
    return [
      <Tabs.Panel title={<i className="fa fa-fw fa-list"></i>} key="playlists">
        <PlaylistBrowserTab></PlaylistBrowserTab>
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-folder-open-o"></i>} key="files">
        <FileBrowserTab></FileBrowserTab>
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-gears"></i>} key="settings">
        <SettingsTab></SettingsTab>
      </Tabs.Panel>
    ]
  },
  handleAfter: function(){

  }
})

module.exports = Sidebar
