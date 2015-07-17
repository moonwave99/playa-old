"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes
var FileBrowser = require('./FileBrowser.jsx')
var FileBrowserActions = require('../../actions/FileBrowserActions')
var FileBrowserStore = require('../../stores/FileBrowserStore')
var NavGenerator = require('../../generators/Navigable.jsx')

var FileBrowserOnSteroids = NavGenerator(FileBrowser, 'fileBrowser',
  function(component){
    return component.props.tree.map( i => i.id )
  },
  function(component){
    return _.find(component.props.tree, { id: component.state.selection[0] })
  }
)

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
      <FileBrowserOnSteroids
        allowMultipleSelection={true}
        handleDelKeyPress={this.handleDelKeyPress}
        handleEnterKeyPress={this.handleEnterKeyPress}
        handleScrollToElement={this.handleScrollToElement}
        handleArrowClick={this.handleArrowClick}
        handleOpen={this.handleOpen}
        handleClose={this.handleClose}
        isFocused={this.props.isFocused}
        tree={this.state.fileTree}/>
    )
  },
  handleDelKeyPress: function(event, item, elementsToRemove){

  },
  handleEnterKeyPress: function(event, item){

  },
  handleScrollToElement: function(state, list){

  },
  handleArrowClick: function(event, item){
    if(item.props.collapsed){
      FileBrowserActions.expandNodes([item.props.node])
    }else{
      FileBrowserActions.collapseNodes([item.props.node])
    }
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
