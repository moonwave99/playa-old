"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var key = require('keymaster')

module.exports = function(Component, scopeName, getIdList, getSelectedElement, getSelectedIds){
  getSelectedIds = getSelectedIds || function(component){
    return component.state.selection
  }

  const NavigableComponent = React.createClass({
    propTypes: {
      handleDelKeyPress: ReactPropTypes.func.isRequired,
      handleEnterKeyPress: ReactPropTypes.func.isRequired,
      handleScrollToElement: ReactPropTypes.func.isRequired,
      isFocused: ReactPropTypes.bool,
      allowMultipleSelection: ReactPropTypes.bool
    },
    getIdList() {
      return getIdList(this)
    },
    getSelectedElement(){
      return getSelectedElement(this)
    },
    getSelectedIds(){
      return getSelectedIds(this)
    },
    getInitialState() {
      return {
        selection: this.props.initSelection || [],
        openElements: []
      }
    },
    componentDidMount() {
      key('backspace, del', scopeName, this.handleDelKeyPress)
      key('enter', scopeName, this.handleEnterKeyPress)
      key('command+a', scopeName, this.handleSelectAllKeyPress)
      if(this.props.allowMultipleSelection){
        key('up, down, shift+up, shift+down, alt+up, alt+down, shift+alt+up, shift+alt+down', scopeName, this.handleArrowKeyPress)
      }else{
        key('up, down, alt+up, alt+down', scopeName, this.handleArrowKeyPress)
      }
      key('left, right', scopeName, this.handleLeftRightKeyPress)
      key.setScope(scopeName)
    },
    componentWillUnmount() {
      key.unbind('backspace', scopeName)
      key.unbind('del', scopeName)
      key.unbind('enter', scopeName)
      key.unbind('command+a', scopeName)
      key.unbind('up', scopeName)
      key.unbind('down', scopeName)
      key.unbind('left', scopeName)
      key.unbind('right', scopeName)
      key.unbind('alt+up', scopeName)
      key.unbind('alt+down', scopeName)
      if(this.props.allowMultipleSelection){
        key.unbind('shift+up', scopeName)
        key.unbind('shift+down', scopeName)
        key.unbind('shift+alt+up', scopeName)
        key.unbind('shift+alt+down', scopeName)
      }
    },
    componentWillUpdate(nextProps, nextState){
      this.props.handleScrollToElement(nextState, this.getIdList())
      if(nextProps.isFocused){
        this.focus()
      }
    },
    render() {
      return (
        <div onClick={this.handleFocusClick}>
          <Component
            handleClick={this.handleClick}
            focusParent={this.focus}
            closeElements={this.closeElements}
            {...this.props}
            {...this.state} />
        </div>
      )
    },
    handleFocusClick(event){
      this.focus()
    },
    focus(params = {}){
      key.setScope(scopeName)
      if(params.id && params.direction == 'down'){
        var ids = this.getIdList()
        var currentIndex = ids.indexOf(params.id)
        if(currentIndex < ids.length -1){
          this.setState({
            selection : [ids[currentIndex+1]]
          })
        }
      }
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
      }else if(event.shiftKey && this.props.allowMultipleSelection){
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
          this.openElements(this.state.selection)
          break
        case 37: // left
          this.closeElements(this.state.selection)
          break
      }
    },
    handleDelKeyPress(event) {
      this.props.handleDelKeyPress(event, this, getSelectedIds(this))
      this.setState({
        selection: []
      })
    },
    handleSelectAllKeyPress(event) {
      this.setState({
        selection: this.getIdList()
      })
    },
    openElements(ids){
      this.setState({
        openElements: _.uniq(this.state.openElements.concat(ids))
      })
    },
    closeElements(ids){
      this.setState({
        openElements: _.difference(this.state.openElements, ids)
      })
    }
  })

  return NavigableComponent
}
