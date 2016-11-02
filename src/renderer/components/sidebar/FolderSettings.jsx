"use babel"

var _ = require('lodash')
var cx = require('classnames')
var React = require('react')
var ReactPropTypes = React.PropTypes

var SettingsActions = require('../../actions/SettingsActions')

var FolderSettings = React.createClass({
  getInitialState: function(){
    return {
      fileBrowserRoot: this.props.settings.user.fileBrowserRoot
    }
  },
  render: function(){
    return (
      <form className="settings-block">
        <h2><i className="fa fa-fw fa-folder-o"></i> Folders</h2>
        <p>Current file browser root: <strong>{ this.props.settings.user.fileBrowserRoot }</strong></p>
        <p>
          <label htmlFor="fileBrowserRoot" className="btn btn-default btn-sm btn-block"><i className="fa fa-fw fa-folder-open"></i> Change Folder</label>
          <input type="file" onChange={this.handleFolderChange} className="hidden" id="fileBrowserRoot" ref={this.setCustomAttributes}/>
        </p>
      </form>
    )
  },
  handleFolderChange: function(event){
    let folders = event.currentTarget.files
    if(!folders.length)
      return
    SettingsActions.set('user', 'fileBrowserRoot', folders[0].path)
    this.setState({
      fileBrowserRoot: folders[0].path
    })
  },
  setCustomAttributes: function(input){
    if(!input)
      return
    input.setAttribute('webkitdirectory', '')
    input.setAttribute('directory', '')
  }

})

module.exports = FolderSettings
