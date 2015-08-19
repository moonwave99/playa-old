"use babel"

var _ = require('lodash')
var ipc = require('ipc')
var path = require('path')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var OpenPlaylistActions = require('../actions/OpenPlaylistActions')

var InfoDrawer = React.createClass({
  handlerLocateFolderClick: function(folder, files){
    var remoteFolder = ipc.sendSync('request:open:dialog', {
      title: 'Locate folder for ' + folder,
      properties: ['openDirectory']
    })
    remoteFolder[0] && OpenPlaylistActions.locateFolder(this.props.selectedPlaylist.id, files.map( f => path.join(folder, f) ), remoteFolder[0])
  },
  renderFolder: function(files, folder){
    return (
      <li key={folder}>
        <a href="#" className="btn btn-default btn-xs pull-right" onClick={ event => this.handlerLocateFolderClick(folder, files) }>Locate</a>
        <strong><i className="fa fa-fw fa-folder"></i> {folder}:</strong>
        <ul className="list-unstyled">{files.map( f => <li key={path.join(folder, f)}>{ f }</li>)}</ul>
      </li>
    )
  },
  renderErrors: function(){
    if(this.props.selectedPlaylist.loadErrors.length){
      return (
        <div>
          <h3>Following files could not be opened:</h3>
          <ul className="playlist-errors list-unstyled">
            {_.map(this.props.selectedPlaylist.getGrouppedErrors(), this.renderFolder)}
          </ul>
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
