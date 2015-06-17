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
        <ul className="icons list-unstyled">
          <li><a href="#" onClick={this.handleViewSwitchClick}><i className="fa fa-fw fa-th-large"></i></a></li>
        </ul>
      </div>
    )
  },
  handleViewSwitchClick: function(event){
    this.props.handleViewSwitchClick(this)
  }
})

module.exports = Sidebar