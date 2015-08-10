"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')
var moment = require('moment')
require("moment-duration-format")

var InfoDrawer = React.createClass({
  renderErrors: function(){
    if(this.props.selectedPlaylist.loadErrors.length){
      return (
        <div>
          <h3>Following files could not be opened:</h3>
          <ol className="playlist-errors">
            {this.props.selectedPlaylist.loadErrors.map((error, index)=>{
              return <li key={index}>{error.message.replace('ENOENT: no such file or directory, open ', '')}</li>
            })}
          </ol>
        </div>
      )
    }else{
      return (
        <p>No errors.</p>
      )
    }
  },
  render: function() {
    var classes = cx({
      'info-drawer' : true
    })
    return (
      <div className={classes}>
        {this.renderErrors()}
      </div>
    )
  }
})

module.exports = InfoDrawer
