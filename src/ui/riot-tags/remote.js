<remote class="{ remote-controller: true, show-album: this.showAlbum }">

  <div class="panel-wrapper">
    <section class="panel playlist">
      <ul class="list-unstyled">
        <li
          each={ album, a in playlist.albums }
          class={ clearfix: true, disabled: album.disabled, playing: album.id == parent.currentAlbum.id }
          onclick={parent.onAlbumClick.bind(parent)} data-id={album.id}>
          <span class="cover" onclick={parent.onCoverClick.bind(parent)} data-action="gotoAlbum">
            <img src={ '/covers/' + album.cover }>
          </span>
          <span class="artist">{ album.artist }</span>
          <span class="title">{ album.title } <i class="fa fa-fw fa-volume-up playing-icon"></i></span>
          <span class="year">{ album.year }</span>
        </li>
      </ul>
    </section>

    <section class="panel album-detail">
      <header>
        <h2>
          <span class="artist">{ this.shownAlbum.artist }</span>
          <span class="title">{ this.shownAlbum.title }</span>
          <span class="year">{ this.shownAlbum.year }</span>
          <img class="cover" src={ '/covers/' + this.shownAlbum.cover }>
        </h2>
      </header>
      <ol class="list-unstyled">
        <li
          each={ track, t in this.shownAlbum.tracks }
          class={playing: track.id == parent.playbackInfo.currentTrackID}
          onclick={parent.onTrackClick.bind(parent)}
          data-id={track.id}
          data-album-id={parent.shownAlbum.id}
          data-action="gotoTrack">
          <i class="fa fa-fw fa-volume-up playing-icon"></i>
          <span class="track-number">{ track.track }</span>
          <span class="track-title">{ track.title }</span>
          <span class="track-duration">{ track.formattedDuration }</span>
        </li>
      </ol>
    </section>
  </div>

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
    <p class="playback-info">
      <span class="time-progress">{ this.playbackInfo.formattedCurrentTime }</span>
      <span class="current-track">{ this.playbackInfo.formattedTitle }</span>
      <span class="time-remaining">{ this.playbackInfo.formattedRemainingTime }</span>
    </p>
    <div class="footer playlist-title">
      <i class="fa fa-fw fa-file-audio-o"></i> { this.playlist.title }
    </div>
    <a href="#" class="footer back-button" onclick={this.backToAlbumList.bind(this)}>
      <i class="fa fa-fw fa-chevron-left"></i> Back to Album List
    </a>
  </section>

  <script>
    this.socket = opts.socket
    this.playlist = {}
    this.albums = []
    this.playbackInfo = {}
    this.currentAlbum = {}
    this.shownAlbum = {}
    this.showAlbum = false

    this.socket.on('playlist', function(playlist){
      this.update({
        playlist: playlist
      })
    }.bind(this))

    this.socket.on('playbackInfo', function(playbackInfo){
      var currentAlbum = _.findWhere(this.playlist.albums, { id: playbackInfo.currentAlbumID }) || {}
      var currentTrack = _.findWhere(currentAlbum.tracks || [], { id: playbackInfo.currentTrackID }) || {}
      this.update({
        playbackInfo: playbackInfo,
        currentAlbum: currentAlbum,
        currentTrack: currentTrack
      })
    }.bind(this))

    this.onPlaybackBarClick = function(event){
      event.preventDefault()
      this.socket.emit('control:playback', { action: event.currentTarget.dataset.action })
    }

    this.onCoverClick = function(event){
      event.preventDefault()
      event.stopPropagation()
      this.socket.emit('control:playback', {
        action: event.currentTarget.dataset.action,
        playlistId: this.playlist.id,
        albumId: event.item.album.id
      })
    }

    this.onAlbumClick = function(event){
      event.preventDefault()
      this.showAlbum = true
      this.shownAlbum = _.findWhere(this.playlist.albums, { id: event.currentTarget.dataset.id })
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

    this.onTrackClick = function(event){
      event.preventDefault()
      this.socket.emit('control:playback', {
        action: event.currentTarget.dataset.action,
        playlistId: this.playlist.id,
        albumId: event.currentTarget.dataset.albumId,
        trackId: event.currentTarget.dataset.id
      })
    }

    this.backToAlbumList = function(event){
      event.preventDefault()
      this.showAlbum = false
      this.shownAlbum = {}
    }
  </script>

</remote>
