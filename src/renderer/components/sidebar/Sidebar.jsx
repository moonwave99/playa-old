"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var Tabs = require('react-simpletabs')
var ReactPropTypes = React.PropTypes
var PlaylistBrowserTab = require('./PlaylistBrowserTab.jsx')
var FileBrowserTab = require('./FileBrowserTab.jsx')
var SettingsTab = require('./SettingsTab.jsx')
var PlaylistBrowserActions = require('../../actions/PlaylistBrowserActions')
var FileBrowserActions = require('../../actions/FileBrowserActions')

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
        <PlaylistBrowserTab isFocused={this.props.isOpen && this.props.selectedTab == 0}></PlaylistBrowserTab>
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-folder-open-o"></i>} key="files">
        <FileBrowserTab isFocused={this.props.isOpen && this.props.selectedTab == 1}></FileBrowserTab>
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-cog"></i>} key="settings">
        <SettingsTab isFocused={this.props.isOpen && this.props.selectedTab == 2}></SettingsTab>
      </Tabs.Panel>
    ]
  },
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu){
    switch(selectedIndex){
      case 1:
        PlaylistBrowserActions.loadRoot()
        break
      case 2:
        FileBrowserActions.loadRoot()
        break
    }
  }
})

module.exports = Sidebar
