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
      var duration = item.file.duration()
      return <PlaylistItem key={item.id} metadata={metadata} duration={duration} itemKey={item.id}/>
    })
    return (
      <div className="playlist">
        <table className="table">
          <colgroup>
            <col className="playlist-column-xs" />
            <col className="playlist-column-md" />
            <col className="playlist-column-md" />
            <col className="playlist-column-md" />
            <col className="playlist-column-sm" />
            <col className="playlist-column-sm" />
          </colgroup>
          <tbody>{items}</tbody>
        </table>
      </div>
    )
  }
})

module.exports = Playlist