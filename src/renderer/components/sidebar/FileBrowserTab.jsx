"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes
var FileBrowser = require('./FileBrowser.jsx')
var FileBrowserActions = require('../../actions/FileBrowserActions')
var FileBrowserStore = require('../../stores/FileBrowserStore')
var NavGenerator = require('../../generators/Navigable.jsx')

var KeyboardFocusActions = require('../../actions/KeyboardFocusActions')
var KeyboardNameSpaceConstants = require('../../constants/KeyboardNameSpaceConstants')

var FileBrowserOnSteroids = NavGenerator(FileBrowser, KeyboardNameSpaceConstants.FILE_BROWSER,
  function(component){
    return component.props.tree.map( i => i.id )
  },
  function(component){
    return _.find(component.props.tree, { id: component.state.selection[0] })
  }
)

var _overflows = function(parent, element){
  var parentBounds = parent.getBoundingClientRect()
  var elBounds = element.getBoundingClientRect()
  var direction = 0
  if((elBounds.top + elBounds.height) > (parentBounds.top + parentBounds.height)){
    direction = 1
  }else if(elBounds.top < parentBounds.top){
    direction = -1
  }
  return {
    direction: direction,
    parentBounds: parentBounds,
    elBounds: elBounds
  }
}

var FileBrowserTab = React.createClass({
  getInitialState: function(){
    return {
      fileTree: FileBrowserStore.getFileTree()
    }
  },
  componentDidMount: function(){
    FileBrowserStore.addChangeListener(this._onFileBrowserChange)
  },
  componentWillUnmount: function(){
    FileBrowserStore.removeChangeListener(this._onFileBrowserChange)
  },
  render: function() {
    return (
      <div onClick={this.handleGlobalClick}>
        <FileBrowserOnSteroids
          allowMultipleSelection={true}
          handleDelKeyPress={this.handleDelKeyPress}
          handleEnterKeyPress={this.handleEnterKeyPress}
          handleScrollToElement={this.handleScrollToElement}
          handleArrowClick={this.handleArrowClick}
          handleContextMenu={this.handleContextMenu}
          handleOpen={this.handleOpen}
          handleClose={this.handleClose}
          isFocused={this.props.isFocused}
          tree={this.state.fileTree}/>
      </div>
    )
  },
  handleGlobalClick: function(event){
    KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.FILE_BROWSER)
  },
  handleDelKeyPress: function(event, item, elementsToRemove){

  },
  handleEnterKeyPress: function(event, item){

  },
  handleScrollToElement: function(state, list){
    this.props.handleScrollToElement(state, list)
  },
  handleArrowClick: function(event, item){
    if(item.props.collapsed){
      FileBrowserActions.expandNodes([item.props.node])
    }else{
      FileBrowserActions.collapseNodes([item.props.node])
    }
  },
  handleContextMenu: function(event, item){

  },
  handleOpen: function(ids){
    FileBrowserActions.expandNodes(this.state.fileTree.filter((node)=>{
      return _.contains(ids, node.id)
    }))
  },
  handleClose: function(ids){
    FileBrowserActions.collapseNodes(this.state.fileTree.filter((node)=>{
      return _.contains(ids, node.id)
    }))
  },
  _onFileBrowserChange: function(){
    this.setState({
      fileTree: FileBrowserStore.getFileTree()
    })
  }
})

module.exports = FileBrowserTab
