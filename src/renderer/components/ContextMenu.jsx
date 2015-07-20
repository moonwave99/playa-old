"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var ContextMenu = React.createClass({
  propTypes: {
    actions: ReactPropTypes.array.isRequired,
    position: ReactPropTypes.object.isRequired,
    isVisible: ReactPropTypes.bool.isRequired
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
        {this.props.actions.map( action => <li key={action.label}><a href="#" onClick={action.handler}>{action.label}</a></li> )}
      </ul>
    )
  }
})

module.exports = ContextMenu
