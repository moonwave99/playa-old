"use babel"

var _ = require('lodash')
var React = require('react')
var key = require('keymaster')

module.exports = function(Component, scopeName, getIdList, getSelectedElement){

  const NavigableComponent = React.createClass({
    getIdList() {
      return getIdList(this)
    },
    getSelectedElement(){
      return getSelectedElement(this)
    },
    getInitialState() {
      return {
        selection: [],
        openElements: []
      }
    },
    componentDidMount() {
      key('backspace, del', scopeName, this.handleDelKeyPress)
      key('enter', scopeName, this.handleEnterKeyPress)    
      key('command+a', scopeName, this.handleSelectAllKeyPress)
      key('up, down, shift+up, shift+down, alt+up, alt+down, shift+alt+up, shift+alt+down', scopeName, this.handleArrowKeyPress)
      key('left, right', scopeName, this.handleLeftRightKeyPress)
      key.setScope(scopeName)      
    },
    componentWillUnmount() {
      key.unbind('backspace')
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
      key.unbind('left')
      key.unbind('right')       
    },
    render() {
      return (
        <Component
          handleClick={this.handleClick}
          {...this.props}
          {...this.state} />
      )
    },
    handleClick(event, item) {
      var ids = this.getIdList()
      var index = ids.indexOf(item.props.itemKey)
    
      var [low, hi] = [
        ids.indexOf(this.state.selection[0]),
        ids.indexOf(this.state.selection[this.state.selection.length-1])
      ]

      if(event.metaKey){
        this.setState({
          selection: item.props.isSelected ? _.without(this.state.selection, item.props.itemKey) : this.state.selection.concat([item.props.itemKey])
        })
      }else if(event.shiftKey){
        this.setState({
          selection: ids.slice(
            Math.min(low, index), Math.max(hi, index)+1
          )
        })
      }else{
        this.setState({
          selection: [item.props.itemKey]
        })
      }
    },
    handleEnterKeyPress(event) {
      this.props.handleEnterKeyPress(event, this)
    },
    handleArrowKeyPress(event) {
      var ids = this.getIdList()
      var [low, hi] = [
        ids.indexOf(this.state.selection[0]),
        ids.indexOf(this.state.selection[this.state.selection.length-1])
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
            newHi = ids.length-1
          }else if(event.shiftKey){
            newHi = Math.min(ids.length-1, hi+1)
          }else if(event.altKey){
            newLow = newHi = ids.length-1
          }else{
            newLow = Math.min(ids.length-1, low+1)
            newHi = newLow
          }        
          break        
      }
      this.setState({
        selection: ids.slice(newLow, newHi+1)
      })      
    },
    handleLeftRightKeyPress(event){
      switch(event.which){
        case 39: // right
          this.setState({
            openElements: _.uniq(this.state.openElements.concat(this.state.selection))
          })
          break
        case 37: // left
          this.setState({
            openElements: _.difference(this.state.openElements, this.state.selection)
          })
          break        
      }
    },
    handleDelKeyPress(event) {
      this.props.handleDelKeyPress(event, this)
      this.setState({
        selection: []
      })      
    },
    handleSelectAllKeyPress(event) {
      this.setState({
        selection: this.getIdList()
      })      
    }
  })
  
  return NavigableComponent
  
}