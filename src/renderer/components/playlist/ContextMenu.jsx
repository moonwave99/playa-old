"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var ContextMenu = React.createClass({
  propTypes: {
    actions: ReactPropTypes.array.isRequired
  },
  render: function() {
    var classes = cx({
      'context-menu'  : true,
      'list-unstyled' : true
    })
    return (
      <ul className={classes}>
        {this.props.actions.map( action => <li key={action.label}><a href="#" onClick={action.handler}>{action.label}</a></li> )}
      </ul>
    )
  }
})

module.exports = ContextMenu
