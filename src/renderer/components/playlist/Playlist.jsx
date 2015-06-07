"use babel"

var React = require('react')
var PlaylistItem = require('./PlaylistItem.jsx')
var ReactPropTypes = React.PropTypes
var _ = require('lodash')

var Playlist = React.createClass({
  propTypes: {
    items: ReactPropTypes.array
  },
  render: function() {
    var items = _.map(this.props.items, (item, index)=>{
      return <PlaylistItem key={item.id} metadata={item.file.metadata()} />
    })
    return (
      <ul className="list-unstyled">{items}</ul>
    )
  }
})

module.exports = Playlist