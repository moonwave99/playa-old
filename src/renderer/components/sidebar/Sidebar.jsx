"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var PlaylistBrowser = require('./PlaylistBrowser.jsx')
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
        <PlaylistBrowser/>
      </div>
    )
  }
})

module.exports = Sidebar