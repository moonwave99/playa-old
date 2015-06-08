"use babel"

var _ = require('lodash')
var React = require('react')
var ReactPropTypes = React.PropTypes
var MetaDoctor = require('../../util/MetaDoctor')
var PlaylistItem = require('./PlaylistItem.jsx')

var Playlist = React.createClass({
  propTypes: {
    items: ReactPropTypes.array
  },
  render: function() {
    var items = _.map(this.props.items, (item, index)=>{
      var metadata = MetaDoctor.normalise(item.file.metadata())
      return <PlaylistItem key={item.id} metadata={metadata} itemKey={item.id}/>
    })
    return (
      <div className="playlist">
        <table className="table"><tbody>{items}</tbody></table>
      </div>
    )
  }
})

module.exports = Playlist