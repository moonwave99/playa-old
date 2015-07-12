"use babel"

var shell = require('shell')
var React = require('react')
var ReactPropTypes = React.PropTypes
var cx = require('classnames')

var ContextMenu = React.createClass({
  propTypes: {
    album: ReactPropTypes.object.isRequired
  },
  render: function() {
    var classes = cx({
      'context-menu'  : true,
      'list-unstyled' : true
    })
    return (
      <ul className={classes}>
        <li><a href="#" onClick={this.handleFinderClick}>Reveal in Finder</a></li>
        <li><a href="#" onClick={this.handleDiscogsClick}>Search on Discogs</a></li>
        <li><a href="#" onClick={this.handleRYMClick}>Search on RYM</a></li>
        <li><a href="#" onClick={this.handleLastfmClick}>Search on Last.fm</a></li>
      </ul>
    )
  },
  handleFinderClick: function(event){
    event.stopPropagation()
    shell.openExternal('file://' + this.props.album.getFolder())
  },
  handleDiscogsClick: function(event){
    event.stopPropagation()
    this.openLink('http://www.discogs.com/search?type=release&q=')
  },
  handleRYMClick: function(event){
    event.stopPropagation()
    this.openLink('https://rateyourmusic.com/search?searchtype=l&searchterm=')
  },
  handleLastfmClick: function(event){
    event.stopPropagation()
    this.openLink('http://www.last.fm/search?type=album&q=')
  },
  openLink: function(base){
    shell.openExternal(base + encodeURIComponent(this.props.album.getArtist() + ' ' + this.props.album.getTitle()))
  }
})

module.exports = ContextMenu
