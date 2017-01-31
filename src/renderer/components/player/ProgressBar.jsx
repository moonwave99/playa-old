import React, { Component, PropTypes } from 'react';

class ProgressBar extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.updateWaveform = this.updateWaveform.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (!this.props.currentTrack) {
      this.updateWaveform(null);
    } else if (
      this.props.currentTrack
      && (!prevProps.currentTrack || prevProps.currentTrack.id !== this.props.currentTrack.id)
    ) {
      this.updateWaveform(null);
      playa.waveformLoader.load(this.props.currentTrack)
        .then(this.updateWaveform)
        .catch( err => console.error(err, err.stack));  // eslint-disable-line
    }
  }
  handleMouseEnter() {
    this.cursor.style.opacity = '1';
  }
  handleMouseOut() {
    this.cursor.style.opacity = '0';
  }
  handleClick(event) {
    if (!this.props.playing) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    this.waveformProgress.classList.toggle('clicked', true);
    setTimeout(
      () => this.waveformProgress.classList.toggle('clicked', false)
      , 100
    );
    this.props.seekTo(position);
  }
  handleMouseMove(event) {
    const waveformBounds = event.currentTarget.getBoundingClientRect();
    const percent = ((event.clientX - waveformBounds.left) / waveformBounds.width) * 100;
    this.cursor.style.left = `${percent}%`;
  }
  updateWaveform(waveform) {
    if (waveform) {
      this.waveform.style.backgroundImage = `url('file://${encodeURI(waveform)}')`;
      this.waveform.classList.add('loaded');
    } else {
      this.waveform.classList.remove('loaded');
    }
  }
  render() {
    const percent = (this.props.currentTime / this.props.totalTime) * 100;
    const waveformProgressStyle = {
      transform: `translateX(${percent}%)`,
    };
    return (
      <div
        className="progress-wrapper"
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseOut}
        onClick={this.handleClick}
      >
        <div
          className="waveform"
          ref={(c) => { this.waveform = c; }}
        />
        <div
          className="waveform-progress"
          ref={(c) => { this.waveformProgress = c; }}
          style={waveformProgressStyle}
        />
        <div
          className="progress-cursor"
          ref={(c) => { this.cursor = c; }}
        />
      </div>
    );
  }
}

ProgressBar.propTypes = {
  currentTime: PropTypes.number,
  totalTime: PropTypes.number,
  seekTo: PropTypes.func,
  currentTrack: PropTypes.shape({
    id: PropTypes.string,
  }),
  playing: PropTypes.bool,
};

export default ProgressBar;
