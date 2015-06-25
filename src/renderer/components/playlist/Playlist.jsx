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
            <PlaylistAlbums albums={this.groupByAlbum()} playlist={this.props.playlist} onDoubleClick={this.handleDoubleClick} currentItem={this.props.currentItem}/>  
          </div>
        )
        break
      default:
        return (
          <div className="playlist">
            <PlaylistTable playlist={this.props.playlist} onDoubleClick={this.handleDoubleClick} currentItem={this.props.currentItem}/>        
          </div>
        )        
        break;
    }
  },
  handleScroll: function(event){
    this.props.handleScroll(this, event)
  },
  handleDoubleClick: function(item){
    OpenPlaylistActions.playFile(item.props.itemKey, this.props.playlist)
    PlayerActions.play()    
  },
  groupByAlbum: function(){
    return _.reduce(this.props.playlist.items, (memo, item)=>{
      var album = _.find(memo, (i)=>{ return i.title == item.metadata.album  })
      if(!album){
        album = {
          title: item.metadata.album,
          tracks: []
        }
        memo.push(album)
      }
      album.tracks.push(item)
      return memo
    }, [])    
  }
})

module.exports = Playlist