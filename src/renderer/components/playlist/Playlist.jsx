"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistTable = require('./PlaylistTable.jsx')
var PlaylistAlbums = require('./PlaylistAlbums.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var Playlist = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    currentItem: ReactPropTypes.object,
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func,
    handleScroll: ReactPropTypes.func    
  },
  componentDidMount: function(){
    var node = React.findDOMNode(this)
    node.addEventListener('scroll', _.throttle(this.handleScroll, 100))
    node.scrollTop = this.props.playlist.scrollBy
  },
  componentWillUnmount: function(){
    React.findDOMNode(this).removeEventListener('scroll')
  },
  render: function() {
    switch(this.props.playlist.displayMode){
      case 'albums':
        return (
          <div className="playlist">
            <PlaylistAlbums playlist={this.props.playlist} onDoubleClick={this.handleDoubleClick} onClick={this.handleClick} currentItem={this.props.currentItem}/>  
          </div>
        )
        break
      default:
        return (
          <div className="playlist">
            <PlaylistTable playlist={this.props.playlist} onDoubleClick={this.handleDoubleClick} onClick={this.handleClick} currentItem={this.props.currentItem}/>        
          </div>
        )        
        break;
    }
  },
  handleScroll: function(event){
    this.props.handleScroll(this, event)
  },
  handleClick: function(item){
    
  },
  handleDoubleClick: function(item){
    OpenPlaylistActions.playFile(item.props.itemKey, this.props.playlist)
    PlayerActions.play()    
  }
})

module.exports = Playlist