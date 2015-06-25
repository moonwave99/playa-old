"use babel"

var _ = require('lodash')
var keymaster = require('keymaster')
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
      selectionStart: 0,
      selectionEnd: 0
    }
  },
  componentDidMount: function() {
    keymaster('del', this.handleDelKeyPress)
  },
  componentWillUnmount: function() {
    keymaster.unbind('del')
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
  }
})

module.exports = PlaylistTable