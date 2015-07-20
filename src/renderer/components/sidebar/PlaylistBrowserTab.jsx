"use babel"

var _ = require('lodash')
var cx = require('classnames')
var md5 = require('MD5')
var React = require('react')
var ReactPropTypes = React.PropTypes
var FileBrowser = require('./FileBrowser.jsx')
var PlaylistBrowserStore = require('../../stores/PlaylistBrowserStore')
var PlaylistBrowserActions = require('../../actions/PlaylistBrowserActions')
var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var NavGenerator = require('../../generators/Navigable.jsx')
var AlbumPlaylist = require('../../util/AlbumPlaylist')

var KeyboardFocusActions = require('../../actions/KeyboardFocusActions')
var KeyboardNameSpaceConstants = require('../../constants/KeyboardNameSpaceConstants')

var FileBrowserOnSteroids = NavGenerator(FileBrowser, KeyboardNameSpaceConstants.PLAYLIST_BROWSER,
  function(component){
    return component.props.tree.map( i => i.id )
  },
  function(component){
    return _.find(component.props.tree, { id: component.state.selection[0] })
  }
)

var PlaylistBrowserTab = React.createClass({
  getInitialState: function(){
    return {
      playlistTree: PlaylistBrowserStore.getPlaylistTree()
    }
  },
  componentDidMount: function(){
    PlaylistBrowserStore.addChangeListener(this._onPlaylistBrowserChange)
  },
  componentWillUnmount: function(){
    PlaylistBrowserStore.removeChangeListener(this._onPlaylistBrowserChange)
  },
  render: function() {
    return (
      <div onClick={this.handleGlobalClick}>
        <FileBrowserOnSteroids
          allowMultipleSelection={true}
          handleDelKeyPress={this.handleDelKeyPress}
          handleEnterKeyPress={this.handleEnterKeyPress}
          handleScrollToElement={this.handleScrollToElement}
          handleDoubleClick={this.handleDoubleClick}
          handleArrowClick={this.handleArrowClick}
          handleOpen={this.handleOpen}
          handleClose={this.handleClose}
          isFocused={this.props.isFocused}
          tree={this.state.playlistTree}/>
      </div>
    )
  },
  handleGlobalClick: function(event){
    KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.PLAYLIST_BROWSER)
  },
  handleDelKeyPress: function(event, item, elementsToRemove){

  },
  handleEnterKeyPress: function(event, item){
    if(item.state.selection.length == 1){
      var playlistPath = item.getSelectedElement().path
      this._openPlaylist(playlistPath)
    }
  },
  handleScrollToElement: function(state, list){
    this.props.handleScrollToElement(state, list)
  },
  handleDoubleClick: function(event, item){
    this._openPlaylist(item.props.node.path)
  },
  handleArrowClick: function(event, item){
    if(item.props.collapsed){
      PlaylistBrowserActions.expandNodes([item.props.node])
    }else{
      PlaylistBrowserActions.collapseNodes([item.props.node])
    }
  },
  handleOpen: function(ids){
    var nodes = this._getNodesById(ids)
    nodes.length && PlaylistBrowserActions.expandNodes(nodes)
  },
  handleClose: function(ids){
    var nodes = this._getNodesById(ids)
    nodes.length && PlaylistBrowserActions.collapseNodes(nodes)
  },
  _onPlaylistBrowserChange: function(){
    this.setState({
      playlistTree: PlaylistBrowserStore.getPlaylistTree()
    })
  },
  _openPlaylist: function(playlistPath){
    var playlist = new AlbumPlaylist({ id: md5(playlistPath), path: playlistPath })
    OpenPlaylistActions.add([playlist])
    OpenPlaylistActions.selectById(playlist.id)
  },
  _getNodesById: function(ids){
    return this.state.playlistTree.filter((node)=>{
      return _.contains(ids, node.id) && node.isDirectory()
    })
  }
})

module.exports = PlaylistBrowserTab
