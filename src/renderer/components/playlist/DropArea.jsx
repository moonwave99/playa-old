"use babel"

var shell = require('shell')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var DragSource = require('react-dnd').DragSource
var DropTarget = require('react-dnd').DropTarget
var DragDropConstants = require('../../constants/DragDropConstants')

const dropAreaTarget = {
  drop(props, monitor, component) {
    var sourceItem = monitor.getItem()
    switch(sourceItem.source){
      case DragDropConstants.FILEBROWSER_FOLDER:
        props.handleFolderDrop(sourceItem.node.path)
        break
      case DragDropConstants.PLAYLIST_ALBUM:
        const draggedId = monitor.getItem().id
        props.moveAlbum(draggedId, null, 'after')
        break
    }
    props.handleDragEnd()
  },
  hover(props, monitor, component) {
    React.findDOMNode(component).classList.add('over')
  }
}

var DropArea = React.createClass({
  render: function() {
    var classes = cx({
      'drop-area' : true
    })
    return this.props.connectDropTarget(
      <div className={classes}>
        <span className="text">Drop your content here!</span>
      </div>
    )
  }
})

DropArea = DropTarget([
    DragDropConstants.PLAYLIST_ALBUM,
    DragDropConstants.FILEBROWSER_FOLDER
  ], dropAreaTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(DropArea)

module.exports = DropArea
