"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var PlaylistBrowser = React.createClass({
  render: function() {
    var classes = cx({
      'playlist-browser' : true
    })
    return (
      <div className={classes}></div>
    )
  }
})

module.exports = PlaylistBrowser