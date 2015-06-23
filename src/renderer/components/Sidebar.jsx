"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var Sidebar = React.createClass({
  getInitialState: function(){
    return {
      isOpen: false
    }
  },
  render: function() {
    var classes = cx({
      'sidebar' : true,
      'sidebar-left' : true,
      'open' : this.props.isOpen
    })
    return (
      <div className={classes}>
        <ul className="icons list-unstyled"></ul>
      </div>
    )
  }
})

module.exports = Sidebar