import React, { Component, PropTypes } from 'react';
import wavesurfer from 'wavesurfer.js';
import { encodePath } from '../../util/helpers/url';

class ProgressBar extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.updateWaveform = this.updateWaveform.bind(this);
  }
  componentDidMount() {
    this.wavesurfer = wavesurfer.create(
      Object.assign(this.props.wavesurferSettings, {
        container: this.waveform,
        interact: false,
      }),
    );
    this.wavesurfer.on('ready', () => {
      this.waveform.classList.add('loaded');
    });
  }
  componentDidUpdate(prevProps) {
    this.updateWaveform(this.props.currentTrack, prevProps.currentTrack);
  }
  componentWillUnmount() {
    this.wavesurfer.unAll();
  }
  handleMouseEnter() {
    this.cursor.style.opacity = 1;
  }
  handleMouseOut() {
    this.cursor.style.opacity = 0;
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
      , 100,
    );
    this.props.seekTo(position);
  }
  handleMouseMove(event) {
    const waveformBounds = event.currentTarget.getBoundingClientRect();
    const percent = ((event.clientX - waveformBounds.left) / waveformBounds.width) * 100;
    this.cursor.style.left = `${percent}%`;
  }
  updateWaveform(currentTrack, prevTrack) {
    if (!currentTrack) {
      this.wavesurfer.empty();
      this.waveform.classList.remove('loaded');
    } else if (
      currentTrack
      && (!prevTrack || prevTrack.id !== currentTrack.id)
    ) {
      this.wavesurfer.load(encodePath(currentTrack.filename));
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
  wavesurferSettings: PropTypes.shape({
    waveColor: PropTypes.String,
    progressColor: PropTypes.String,
    height: PropTypes.Number,
  }),
};

export default ProgressBar;
