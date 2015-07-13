"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistBrowser = require('./PlaylistBrowser.jsx')
var PlaylistBrowserStore = require('../../stores/PlaylistBrowserStore')
var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var NavGenerator = require('../../generators/Navigable.jsx')

var PlaylistBrowserOnSteroids = NavGenerator(PlaylistBrowser, 'playlistBrowser',
  function(component){
    return component.props.tree.map( i => i.id )
  },
  function(component){
    return _.findWhere(component.props.tree, { id: component.state.selection[0] })
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
      <PlaylistBrowserOnSteroids
        handleDelKeyPress={this.handleDelKeyPress}
        handleEnterKeyPress={this.handleEnterKeyPress}
        handleScrollToElement={this.handleScrollToElement}
        tree={this.state.playlistTree}/>
    )
  },
  handleDelKeyPress: function(event, item, elementsToRemove){

  },
  handleEnterKeyPress: function(event, item){
    if(item.state.selection.length == 1){
      var playlist = item.getSelectedElement()
      OpenPlaylistActions.add([playlist])
      OpenPlaylistActions.selectById(playlist.id)
    }
  },
  handleScrollToElement: function(state, list){

  },
  _onPlaylistBrowserChange: function(){
    this.setState({
      playlistTree: PlaylistBrowserStore.getPlaylistTree()
    })
  }
})

module.exports = PlaylistBrowserTab
