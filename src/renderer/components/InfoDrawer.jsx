"use babel"

var _ = require('lodash')
var ipc = require('ipc')
var path = require('path')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var OpenPlaylistActions = require('../actions/OpenPlaylistActions')

var InfoDrawer = React.createClass({
  render: function() {
    var classes = cx({
      'info-drawer' : true
    })
    return (
      <div className={classes}></div>
    )
  }
})

module.exports = InfoDrawer
