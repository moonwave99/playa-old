"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes

var PlaylistItem = React.createClass({
  propTypes: {
    metadata: ReactPropTypes.object.isRequired
  },
  render: function() {
    return (
      <li>{ this.props.metadata.track } - { this.props.metadata.artist } - { this.props.metadata.title }</li>
    )
  }
})

module.exports = PlaylistItem