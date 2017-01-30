'use babel';

import React, { PropTypes, Component } from 'react';
import cx from 'classnames';
import { formatTimeShort as formatTime } from '../../util/helpers/formatters';

class AlbumTracklistItem extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
  }
  handleClick(event) {
    this.props.handleClick(event, this);
  }
  handleDoubleClick(event) {
    this.props.handleDoubleClick(event, this);
  }
  renderTrackTitle() {
    const track = this.props.track;
    if (track.disabled) {
      return <span className="track-filename">{track.filename}</span>;
    } else if (this.props.album.getArtistCount() > 1) {
      return (
        <span className="track-title">
          <span className="track-artist">{track.metadata.artist}</span>
          <span className="separator" />
          <span>{track.metadata.title}</span>
        </span>
      );
    }
    return <span className="track-title">{track.metadata.title}</span>;
  }
  render() {
    const track = this.props.track;
    const even = this.props.index % 2 === 0;
    const classes = cx({
      track: true,
      playing: this.props.isPlaying,
      selected: this.props.isSelected,
      odd: !even,
      even,
      disabled: this.props.track.disabled,
    });
    return (
      <li
        className={classes}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}
        data-id={track.id}
      >
        <span className="track-playing-indicator">
          { this.props.isPlaying ? <i className="fa fa-fw fa-volume-up" /> : null }
        </span>
        <span className="track-number">{track.metadata.track}.</span>
        {this.renderTrackTitle()}
        <span className="track-duration sidebar-offset">
          {formatTime(track.duration)}
        </span>
      </li>
    );
  }
}

AlbumTracklistItem.propTypes = {
  index: PropTypes.number,
  album: PropTypes.shape({
    getArtistCount: PropTypes.func,
  }),
  track: PropTypes.shape({
    disabled: PropTypes.bool,
  }),
  isPlaying: PropTypes.bool,
  isSelected: PropTypes.bool,
  handleClick: PropTypes.func,
  handleDoubleClick: PropTypes.func,
};

export default AlbumTracklistItem;
