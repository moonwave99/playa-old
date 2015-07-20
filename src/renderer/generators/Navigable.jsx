"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes

var KeyboardFocusStore = require('../stores/KeyboardFocusStore')
var KeyboardFocusActions = require('../actions/KeyboardFocusActions')

module.exports = function(Component, scopeName, getIdList, getSelectedElement, getSelectedIds){
  getSelectedIds = getSelectedIds || function(component){
    return component.state.selection
  }

  const NavigableComponent = React.createClass({
    propTypes: {
      handleDelKeyPress: ReactPropTypes.func.isRequired,
      handleEnterKeyPress: ReactPropTypes.func.isRequired,
      handleScrollToElement: ReactPropTypes.func.isRequired,
      handleOpen: ReactPropTypes.func,
      handleClose: ReactPropTypes.func,
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
        openElements: [],
        direction: 0
      }
    },
    componentDidMount() {
      KeyboardFocusStore.addChangeListener(this._onKeyboardFocusChange)
    },
    componentWillUnmount() {
      KeyboardFocusStore.removeChangeListener(this._onKeyboardFocusChange)
    },
    componentDidUpdate(prevProps, prevState){
      this.props.handleScrollToElement(this.state, this.getIdList())
      if(this.props.isFocused){
        this.onFocusRequest()
      }
    },
    render() {
      return (
        <Component
          handleClick={this.handleClick}
          focusParent={this.onFocusRequest}
          closeElements={this.closeElements}
          {...this.props}
          {...this.state} />
      )
    },
    onFocusRequest(params = {}){
      if(params.id && params.direction){
        var ids = this.getIdList()
        var currentIndex = ids.indexOf(params.id)
        if(currentIndex < ids.length -1 && currentIndex > -1){
          this.setState({
            selection : [ids[currentIndex + (params.direction == 'up' ? 0 : 1)]]
          })
        }
      }
      if(params.requestFocus){
        KeyboardFocusActions.setFocus(this.getHandlers(), scopeName)
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
      var direction = 0
      switch(event.which){
        case 38: // up
          direction = -1
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
          direction = 1
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
        selection: ids.slice(newLow, newHi+1),
        direction: direction
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
      this.props.handleOpen && this.props.handleOpen(ids)
    },
    closeElements(ids){
      this.setState({
        openElements: _.difference(this.state.openElements, ids)
      })
      this.props.handleClose && this.props.handleClose(ids)
    },
    getHandlers(){
      var handlers = {
        'backspace, del'  : this.handleDelKeyPress,
        'enter'           : this.handleEnterKeyPress,
        'command+a'       : this.handleSelectAllKeyPress,
        'left, right'     : this.handleLeftRightKeyPress
      }
      if(this.props.allowMultipleSelection){
        handlers['up, down, shift+up, shift+down, alt+up, alt+down, shift+alt+up, shift+alt+down'] = this.handleArrowKeyPress
      }else{
        handlers['up, down, alt+up, alt+down'] = this.handleArrowKeyPress
      }
      return handlers
    },
    _onKeyboardFocusChange: function(){
      var currentScopeName = KeyboardFocusStore.getCurrentScopeName()
      if(scopeName == currentScopeName){
        KeyboardFocusActions.setFocus(this.getHandlers(), scopeName)
      }
    }
  })

  return NavigableComponent
}
