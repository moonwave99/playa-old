"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactDOM = require('react-dom')
var Tabs = require('react-simpletabs')
var ReactPropTypes = React.PropTypes
var PlaylistBrowserTab = require('./PlaylistBrowserTab.jsx')
var FileBrowserTab = require('./FileBrowserTab.jsx')
var SettingsTab = require('./SettingsTab.jsx')
var PlaylistBrowserActions = require('../../actions/PlaylistBrowserActions')
var FileBrowserActions = require('../../actions/FileBrowserActions')
var SidebarActions = require('../../actions/SidebarActions')

var KeyboardFocusActions = require('../../actions/KeyboardFocusActions')
var KeyboardNameSpaceConstants = require('../../constants/KeyboardNameSpaceConstants')

var _overflows = function(parent, element){
  var parentBounds = parent.getBoundingClientRect()
  var elBounds = element.getBoundingClientRect()
  var direction = 0
  if((elBounds.top + elBounds.height) > (parentBounds.top + parentBounds.height)){
    direction = 1
  }else if(elBounds.top < parentBounds.top){
    direction = -1
  }
  return {
    direction: direction,
    parentBounds: parentBounds,
    elBounds: elBounds
  }
}

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
      <Tabs.Panel title={<i className="fa fa-fw fa-file-audio-o"></i>} key="playlists">
        <PlaylistBrowserTab
          handleScrollToElement={this.handleScrollToElement}
          isFocused={this.props.isOpen && this.props.selectedTab == 0}/>
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-folder-open-o"></i>} key="files">
        <FileBrowserTab
          handleScrollToElement={this.handleScrollToElement}
          isFocused={this.props.isOpen && this.props.selectedTab == 1}/>
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-cog"></i>} key="settings">
        <SettingsTab isFocused={this.props.isOpen && this.props.selectedTab == 2} settings={this.props.settings}/>
      </Tabs.Panel>
    ]
  },
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu){
    SidebarActions.select(selectedIndex-1)
    setTimeout(()=>{
      KeyboardFocusActions.requestFocus(
        KeyboardNameSpaceConstants[
          selectedIndex == 1 ? 'PLAYLIST_BROWSER' : 'FILE_BROWSER'
        ]
      )
    }, 100)
  },
  handleScrollToElement: function(state, list){
    var wrapper = ReactDOM.findDOMNode(this).querySelector('.tab-panel')
    var targetElement = wrapper.querySelector('[data-id="' + state.selection[0] + '"]')
    if(!targetElement){
      return
    }

    var {direction, parentBounds, elBounds} = _overflows(wrapper, targetElement)
    if(direction < 0){
      wrapper.scrollTop = targetElement.offsetTop
    }else if(direction > 0){
      var maxEls = Math.floor(parentBounds.height / elBounds.height)
      wrapper.scrollTop = (list.indexOf(state.selection[0]) - maxEls +1) * elBounds.height
    }
  }
})

module.exports = Sidebar
