"use babel"

var _ = require('lodash')
var key = require('keymaster')
var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistTableItem = require('./PlaylistTableItem.jsx')

var OpenPlaylistActions = require('../../actions/OpenPlaylistActions')
var PlayerActions = require('../../actions/PlayerActions')

var PlaylistTable = React.createClass({
  propTypes: {
    playlist: ReactPropTypes.object,
    currentItem: ReactPropTypes.object,    
    handleClick: ReactPropTypes.func,
    handleDoubleClick: ReactPropTypes.func
  },
  getInitialState: function(){
    return {
      selectionStart: -1,
      selectionEnd: -1
    }
  },
  componentDidMount: function() {
    key('del', this.handleDelKeyPress)
    key('enter', this.handleEnterKeyPress)
    key('command+a', this.handleSelectAllKeyPress)
    key('up, down, shift+up, shift+down, alt+up, alt+down, shift+alt+up, shift+alt+down', this.handleArrowKeyPress)
  },
  componentWillUnmount: function() {
    key.unbind('del')
    key.unbind('enter')
    key.unbind('command+a')
    key.unbind('up')
    key.unbind('down')
    key.unbind('shift+up')
    key.unbind('shift+down')
    key.unbind('alt+up')
    key.unbind('alt+down')
    key.unbind('shift+alt+up')
    key.unbind('shift+alt+down')    
  },
  render: function() {
    var items = _.map(this.props.playlist.items, (item, index)=>{
      return (
        <PlaylistTableItem
          key={item.id}
          itemKey={item.id}
          metadata={item.metadata}
          duration={item.duration}
          onDoubleClick={this.handleDoubleClick}
          onClick={this.handleClick}
          isPlaying={item.id==this.props.currentItem.id}
          isSelected={index >= this.state.selectionStart && index <= this.state.selectionEnd} />
      )
    })
    return (      
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
    )
  },
  handleClick: function(event, item){
    var index = this.props.playlist.indexOf(item.props.itemKey)
    if(event.shiftKey){
      this.setState({
        selectionStart: Math.min(this.state.selectionStart, index),
        selectionEnd: Math.max(this.state.selectionStart, index)
      })      
    }else{
      this.setState({
        selectionStart: index,
        selectionEnd: index
      })
    }
  },
  handleDoubleClick: function(item){
    OpenPlaylistActions.playFile(item.props.itemKey, this.props.playlist)
    PlayerActions.play()    
  },
  handleDelKeyPress: function(event){
    OpenPlaylistActions.removeFiles(this.state.selectionStart, this.state.selectionEnd, this.props.playlist)
    this.setState({
      selectionStart: -1,
      selectionEnd: -1
    })    
  },
  handleArrowKeyPress: function(event){
    var items = this.props.playlist.items    
    var newStartIndex = this.state.selectionStart
    var newEndIndex = this.state.selectionEnd
    
    switch(event.which){
      case 38: // up
        if(event.shiftKey && event.altKey){
          newStartIndex = 0
        }else if(event.shiftKey){
          newStartIndex = Math.max(0, this.state.selectionStart-1)
        }else if(event.altKey){
          newStartIndex = newEndIndex = 0
        }else{
          newStartIndex = Math.max(0, this.state.selectionStart-1)  
          newEndIndex = newStartIndex
        }
        break
      case 40: // down
        if(event.shiftKey && event.altKey){
          newEndIndex = items.length-1
        }else if(event.shiftKey){
          newEndIndex = Math.min(items.length-1, this.state.selectionEnd+1)
        }else if(event.altKey){
          newStartIndex = newEndIndex = items.length-1
        }else{
          newStartIndex = Math.min(items.length-1, this.state.selectionStart+1)
          newEndIndex = newStartIndex
        }        
        break        
    }
    this.setState({
      selectionStart: newStartIndex,
      selectionEnd: newEndIndex
    })
  },
  handleEnterKeyPress: function(event){
    if((this.state.selectionEnd - this.state.selectionStart) == 0){
      OpenPlaylistActions.playFile(this.props.playlist.items[this.state.selectionStart].id, this.props.playlist)
      PlayerActions.play()
    }
  },
  handleSelectAllKeyPress: function(event){
    this.setState({
      selectionStart: 0,
      selectionEnd: this.props.playlist.items.length-1
    })
  }
})

module.exports = PlaylistTable