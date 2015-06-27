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
      selectionEnd: -1,
      selection: []
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
          isSelected={this.state.selection.indexOf(item.id) > -1} />
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
    
    var [low, hi] = [
      this.props.playlist.indexOf(this.state.selection[0]),
      this.props.playlist.indexOf(this.state.selection[this.state.selection.length-1])
    ]

    if(event.metaKey){
      this.setState({
        selection: item.props.isSelected ? _.without(this.state.selection, item.props.itemKey) : this.state.selection.concat([item.props.itemKey])
      })
    }else if(event.shiftKey){
      this.setState({
        selection: this.props.playlist.items.map( i => i.id ).slice(
          Math.min(low, index), Math.max(hi, index)+1
        )
      })
    }else{
      this.setState({
        selection: [item.props.itemKey]
      })
    }
  },
  handleDoubleClick: function(item){
    OpenPlaylistActions.playFile(item.props.itemKey, this.props.playlist)
    PlayerActions.play()    
  },
  handleDelKeyPress: function(event){
    OpenPlaylistActions.removeFiles(this.state.selection, this.props.playlist)
    this.setState({
      selection: []
    })    
  },
  handleArrowKeyPress: function(event){
    var items = this.props.playlist.items    
    var [low, hi] = [
      this.props.playlist.indexOf(this.state.selection[0]),
      this.props.playlist.indexOf(this.state.selection[this.state.selection.length-1])
    ]
    var newLow = low
    var newHi = hi
    
    switch(event.which){
      case 38: // up
        if(event.shiftKey && event.altKey){
          newLow = 0
        }else if(event.shiftKey){
          newLow = Math.max(0, low-1)
        }else if(event.altKey){
          newLow = newHi = 0
        }else{
          newLow = Math.max(0, low-1)  
          newHi = newLow
        }
        break
      case 40: // down
        if(event.shiftKey && event.altKey){
          newHi = items.length-1
        }else if(event.shiftKey){
          newHi = Math.min(items.length-1, hi+1)
        }else if(event.altKey){
          newLow = newHi = items.length-1
        }else{
          newLow = Math.min(items.length-1, low+1)
          newHi = newLow
        }        
        break        
    }
    this.setState({
      selection: items.map( i => i.id ).slice(newLow, newHi+1)
    })
  },
  handleEnterKeyPress: function(event){
    if(this.state.selection.length == 1){
      var fileToPlay = _.findWhere(this.props.playlist.items, { id: this.state.selection[0] })
      OpenPlaylistActions.playFile(fileToPlay.id, this.props.playlist)
      PlayerActions.play()
    }
  },
  handleSelectAllKeyPress: function(event){
    this.setState({
      selection: this.props.playlist.items.map(i => i.id)
    })
  }
})

module.exports = PlaylistTable