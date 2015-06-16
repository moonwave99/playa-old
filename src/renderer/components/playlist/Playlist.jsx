"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistItem = require('./PlaylistItem.jsx')

var PlaylistActions = require('../../actions/PlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var Playlist = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object
  },
  componentDidMount: function(){
    var node = React.findDOMNode(this)
    node.addEventListener('scroll', _.throttle(this.handleScroll, 100))
    node.scrollTop = this.props.scrollBy
  },
  componentWillUnmount: function(){
    React.findDOMNode(this).removeEventListener('scroll')
  },
  render: function() {
    var items = _.map(this.props.playlist.items, (item, index)=>{
      return <PlaylistItem key={item.id} metadata={item.metadata} duration={item.duration} itemKey={item.id} onDoubleClick={this.handleDoubleClick} onClick={this.handleClick} isPlaying={item.id==this.props.currentItem.id}/>
    })
    return (
      <div className="playlist">
        <table className="table">
          <colgroup>
            <col className="playlist-column-xs" />
            <col className="playlist-column-xs" />
            <col className="playlist-column-md" />
            <col className="playlist-column-md" />
            <col className="playlist-column-md" />
            <col className="playlist-column-sm" />
            <col className="playlist-column-sm" />
          </colgroup>
          <tbody>{items}</tbody>
        </table>
      </div>
    )
  },
  handleScroll: function(event){
    this.props.handleScroll(this, event)
  },
  handleClick: function(item){
    
  },
  handleDoubleClick: function(item){
    PlaylistActions.playFile(item.props.itemKey, this.props.playlist)
    PlayerActions.play()    
  }
})

module.exports = Playlist