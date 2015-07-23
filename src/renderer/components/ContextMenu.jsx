"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')
var ContextMenuActions = require('../actions/ContextMenuActions')

var KeyboardFocusStore = require('../stores/KeyboardFocusStore')
var KeyboardFocusActions = require('../actions/KeyboardFocusActions')
var KeyboardNameSpaceConstants = require('../constants/KeyboardNameSpaceConstants')

var ContextMenu = React.createClass({
  propTypes: {
    actions: ReactPropTypes.array.isRequired,
    position: ReactPropTypes.object.isRequired,
    isVisible: ReactPropTypes.bool.isRequired
  },
  getInitialState: function(){
    return {
      selectedAction: -1
    }
  },
  componentDidMount() {
    KeyboardFocusStore.addChangeListener(this._onKeyboardFocusChange)
  },
  componentWillUnmount() {
    KeyboardFocusStore.removeChangeListener(this._onKeyboardFocusChange)
  },
  componentWillReceiveProps(nextProps){
    this.setState(this.getInitialState())
  },
  render: function() {
    var classes = cx({
      'context-menu'  : true,
      'list-unstyled' : true,
      'visible'       : this.props.isVisible
    })
    var style = {
      top: this.props.position.top,
      left: this.props.position.left
    }
    return (
      <ul className={classes} style={style}>
        {this.props.actions.map( (action, index) => {
          var actionClass = index == this.state.selectedAction ? 'selected' : null
          return <li key={action.label}><a className={actionClass} href="#" onClick={ event => this.handleAction(event, action) }>{action.label}</a></li>
        } )}
      </ul>
    )
  },
  handleAction: function(event, action){
    event.stopPropagation()
    action.handler && action.handler()
    ContextMenuActions.hide()
  },
  handleEscKeyPress: function(event){
    ContextMenuActions.hide()
  },
  handleEnterKeyPress: function(event){
    var action
    if(action = this.props.actions[this.state.selectedAction]){
      this.handleAction(event, action)
    }
  },
  handleArrowKeyPress: function(event){
    switch(event.which){
      case 38: // up
        this.setState({
          selectedAction: Math.max(0, this.state.selectedAction-1)
        })
        break
      case 40: // down
        this.setState({
          selectedAction: Math.min(this.props.actions.length-1, this.state.selectedAction+1)
        })
        break
    }
  },
  getHandlers(){
    var handlers = {
      'esc'       : this.handleEscKeyPress,
      'enter'     : this.handleEnterKeyPress,
      'up, down'  : this.handleArrowKeyPress
    }
    return handlers
  },
  _onKeyboardFocusChange: function(){
    var currentScopeName = KeyboardFocusStore.getCurrentScopeName()
    if(currentScopeName == KeyboardNameSpaceConstants.CONTEXT_MENU){
      KeyboardFocusActions.setFocus(this.getHandlers(), KeyboardNameSpaceConstants.CONTEXT_MENU)
    }
  }
})

module.exports = ContextMenu
