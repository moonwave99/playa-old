<playlist>

  <section class="{ playback-bar: true, playing: this.playbackInfo.playing }">
    <div class="buttons">
      <button onClick={this.onPlaybackBarClick.bind(this)} data-action="prev">
        <i class="fa fa-fw fa-fast-backward"></i>
      </button>
      <button onClick={this.onPlaybackBarClick.bind(this)} data-action="toggle">
        <i class="fa fa-fw fa-pause pause-icon"></i>
        <i class="fa fa-fw fa-play play-icon"></i>
      </button>
      <button onClick={this.onPlaybackBarClick.bind(this)} data-action="next">
        <i class="fa fa-fw fa-fast-forward"></i>
      </button>
    </div>
    <progress
      max={this.playbackInfo.totalTime}
      value={this.playbackInfo.currentTime}
      onclick={this.onProgressClick.bind(this)}
      data-action="seekTo">
    </progress>
    <p class="playback-info">{ this.currentTrack.artist ? (this.currentTrack.artist + ' - ' + this.currentTrack.title) : '' }</p>
  </section>

  <section class="playlist">
    <h2>{ this.playlist.title }</h2>
    <ul class="list-unstyled">
      <li
        each={ album, a in albums }
        class={ clearfix: true, disabled: album.disabled, playing: album.id == parent.playbackInfo.currentAlbumID }
        onClick={parent.onAlbumClick.bind(parent)} data-id={album.id}>
        <span class="author">{ album.artist }</span>
        <span class="title">{ album.title }</span>
        <span class="year">{ album.year }</span>
      </li>
    </ul>
  </section>

  <script>
    this.socket = opts.socket
    this.playlist = {}
    this.albums = []
    this.playbackInfo = {}

    this.socket.on('data', function(data){
      var currentAlbum = _.findWhere(data.playlist.albums, { id: data.playbackInfo.currentAlbumID }) || {}
      var currentTrack = _.findWhere(currentAlbum.tracks || [], { id: data.playbackInfo.currentTrackID }) || {}
      this.update({
        playbackInfo: data.playbackInfo,
        playlist: data.playlist,
        albums: _.where(data.playlist.albums || [], { disabled: false }),
        currentAlbum: currentAlbum,
        currentTrack: currentTrack
      })
    }.bind(this))

    this.onPlaybackBarClick = function(event){
      event.preventDefault()
      this.socket.emit('control:playback', { action: event.currentTarget.dataset.action })
    }

    this.onAlbumClick = function(event){
      event.preventDefault()
      if(event.detail > 1){
        this.socket.emit('control:playback', {
          action: 'gotoAlbum',
          playlistId: this.playlist.id,
          albumId: event.currentTarget.dataset.id
        })
      }
    }

    this.onProgressClick = function(event){
      event.preventDefault()
      var bounds = event.currentTarget.getBoundingClientRect()
      var position = (event.clientX - bounds.left) / bounds.width
      this.socket.emit('control:playback', {
        action: event.currentTarget.dataset.action,
        playlistId: this.playlist.id,
        albumId: event.currentTarget.dataset.id,
        seekTo: position
      })
    }
  </script>

</playlist>
