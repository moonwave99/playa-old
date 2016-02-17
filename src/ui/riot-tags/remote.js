<remote class="{ remote-controller: true, show-album: this.showAlbum }">

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

  <section class="panel playlist">
    <h2 class="header">
      <i class="fa fa-fw fa-file-audio-o"></i> { this.playlist.title }
    </h2>
    <ul class="list-unstyled">
      <li
        each={ album, a in albums }
        class={ clearfix: true, disabled: album.disabled, playing: album.id == parent.playbackInfo.currentAlbumID }
        onclick={parent.onAlbumClick.bind(parent)} data-id={album.id}>
        <span class="cover" onclick={parent.onCoverClick.bind(parent)} data-action="gotoAlbum">
          <img src={ '/covers/' + album.cover }>
        </span>
        <span class="artist">{ album.artist }</span>
        <span class="title">{ album.title }</span>
        <span class="year">{ album.year }</span>
      </li>
    </ul>
  </section>

  <section class="panel album-detail">
    <a href="#" class="header" onclick={this.backToAlbumList.bind(this)}>
      <i class="fa fa-fw fa-chevron-left"></i> Back to Album List
    </a>
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
        onclick={parent.onTrackClick.bind(parent)}
        data-id={track.id}
        data-album-id={parent.shownAlbum.id}
        data-action="gotoTrack">
        <span class="track-number">{ track.track }</span>
        <span class="track-title">{ track.title }</span>
        <span class="track-duration">{ track.formattedDuration }</span>
      </li>
    </ol>
  </section>

  <script>
    this.socket = opts.socket
    this.playlist = {}
    this.albums = []
    this.playbackInfo = {}
    this.currentAlbum = {}
    this.shownAlbum = {}
    this.showAlbum = false

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
      this.shownAlbum = _.findWhere(this.albums, { id: event.currentTarget.dataset.id })
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
