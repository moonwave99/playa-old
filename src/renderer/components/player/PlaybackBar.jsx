import React, { Component } from 'react';
import cx from 'classnames';
import { formatTimeShort as formatTime } from '../../util/helpers/formatters';
import PlayerStore from '../../stores/PlayerStore';
import PlayerActions from '../../actions/PlayerActions';
import ProgressBar from './ProgressBar.jsx';

const getPlayerState = function getPlayerState() {
  return PlayerStore.getPlaybackInfo();
};

const next = function next() {
  PlayerActions.nextTrack();
};

const prev = function prev() {
  PlayerActions.prevTrack();
};

const seekTo = function seekTo(position) {
  PlayerActions.seek(position);
};

class PlaybackBar extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      showRemaining: false,
    }, getPlayerState());
    this.handleTimeIndicatorClick = this.handleTimeIndicatorClick.bind(this);
    this._onPlayerChange = this._onPlayerChange.bind(this);
    this.play = this.play.bind(this);
    this.updateCover = this.updateCover.bind(this);
  }
  componentDidMount() {
    PlayerStore.addChangeListener(this._onPlayerChange);
  }
  componentWillUnmount() {
    PlayerStore.removeChangeListener(this._onPlayerChange);
  }
  getArtistInfo() {
    const metadata = this.state.currentTrack.metadata;
    return metadata.album
      ? `${metadata.artist} - ${metadata.album}`
      : metadata.artist;
  }
  handleTimeIndicatorClick() {
    this.setState({
      showRemaining: !this.state.showRemaining,
    });
  }
  _onPlayerChange() {
    this.setState(getPlayerState());
    if (this.state.currentAlbum) {
      playa.coverLoader.load(this.state.currentAlbum)
        .then(this.updateCover)
        .catch(() => this.updateCover(false));
    }
  }
  play(event) {
    if (!event.clientX) {
      return;
    }
    if (this.state.playing) {
      PlayerActions.pause();
    } else {
      PlayerActions.play();
    }
  }
  updateCover(cover) {
    this.setState({ cover });
  }
  renderCover() {
    if (!this.state.cover) {
      return null;
    }
    return (
      <div className="playback-track-cover">
        <img src={encodeURI(this.state.cover)} role="presentation" />
      </div>
    );
  }
  render() {
    const wrapperClasses = cx({
      'playback-track-info-wrapper': true,
      'show-remaining': this.state.showRemaining,
      'hide-info': this.state.hideInfo,
      'show-waveform': !!this.state.waveform,
    });
    const logoClasses = cx({
      'playback-logo': true,
      'hide-logo': !this.state.hideInfo,
    });

    const title = this.state.currentTrack ? this.state.currentTrack.metadata.title : null;
    const artistInfo = this.state.currentTrack ? this.getArtistInfo() : null;
    return (
      <div className="playback-bar">
        <div className={logoClasses}>Playa.</div>
        <div className="playback-buttons">
          <button onClick={prev}>
            <i className="fa fa-fw fa-fast-backward" />
          </button>
          <button onClick={this.play}>
            {this.state.playing
              ? <i className="fa fa-fw fa-pause" />
              : <i className="fa fa-fw fa-play" />
            }
          </button>
          <button onClick={next}>
            <i className="fa fa-fw fa-fast-forward" />
          </button>
        </div>
        <div className={wrapperClasses}>
          <ProgressBar seekTo={seekTo} {...this.state} />
          { this.renderCover() }
          <span
            className="playback-time-indicator time-progress"
            onClick={this.handleTimeIndicatorClick}
          >
            {formatTime(this.state.currentTime)}
          </span>
          <div className="playback-track-info">
            <span className="playback-track-info-title">{title}</span>
            <span className="playback-track-info-artist">{artistInfo}</span>
          </div>
          <span
            className="playback-time-indicator time-remaining"
            onClick={this.handleTimeIndicatorClick}
          >
            -{formatTime(this.state.remainingTime)}
          </span>
        </div>
      </div>
    );
  }
}

export default PlaybackBar;
