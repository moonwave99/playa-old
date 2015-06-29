"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistBrowser = require('./PlaylistBrowser.jsx')
var PlaylistBrowserStore = require('../../stores/PlaylistBrowserStore')
var cx = require('classnames')

var Sidebar = React.createClass({
  getInitialState: function(){
    return {
      isOpen: false,
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
    var classes = cx({
      'sidebar' : true,
      'sidebar-left' : true,
      'open' : this.props.isOpen
    })
    return (
      <div className={classes}>
        <ul className="icons list-unstyled"></ul>
        <PlaylistBrowser tree={this.state.playlistTree}/>
      </div>
    )
  },
  _onPlaylistBrowserChange: function(){
    this.setState({
      playlistTree: PlaylistBrowserStore.getPlaylistTree()
    })
  }
})

module.exports = Sidebar