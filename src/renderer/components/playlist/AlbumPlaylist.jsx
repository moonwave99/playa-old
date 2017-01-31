import { debounce, findIndex, forEach } from 'lodash';
import cx from 'classnames';
import i18n from 'i18next';
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import ReactList from 'react-list';
import AlbumPlaylistItem from './AlbumPlaylistItem.jsx';
import AlbumTracklistItem from './AlbumTracklistItem.jsx';
import OpenPlaylistActions from '../../actions/OpenPlaylistActions';
import DropArea from './DropArea.jsx';

const getFlattenedList = function getFlattenedList(props, currentTrack) {
  const list = [];
  props.playlist.getItems().forEach((album, index) => {
    const isOpened = props.openElements.indexOf(album.id) > -1;
    list.push({
      id: album.id,
      type: 'album',
      album,
      isOpened,
      isSelected: props.selection.indexOf(album.id) > -1,
      index,
    });
    if (isOpened) {
      const isMultiple = album.isMultiple();
      album.tracks.forEach((track, trackIndex) => {
        if (isMultiple && track.metadata.track === 1) {
          list.push({
            type: 'discNumber',
            disc: track.getDiscNumber(),
            key: `${track.id}_disc_${track.getDiscNumber()}`,
          });
        }
        list.push({
          id: track.id,
          type: 'track',
          track,
          album,
          index: trackIndex,
          isSelected: props.selection.indexOf(track.id) > -1,
          isPlaying: currentTrack && (track.id === currentTrack.id),
        });
      });
    }
  });
  return list;
};

const handleFolderDrop = function handleFolderDrop(folder, afterId) {
  if (!afterId) {
    OpenPlaylistActions.addFolder(folder);
  } else {
    OpenPlaylistActions.addFolderAtPosition(folder, afterId);
  }
};

const itemsRenderer = function itemsRenderer(items, ref) {
  return (
    <ol className="albums list-unstyled" ref={ref}>{items}</ol>
  );
};

const SCROLL_THRESHOLD = 0;

class AlbumPlaylist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: getFlattenedList(props, props.currentTrack),
    };
    this._onListScrollHandler = this._onListScrollHandler.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleTracklistDoubleClick = this.handleTracklistDoubleClick.bind(this);
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleTracklistClick = this.handleTracklistClick.bind(this);
    this.handleTracklistDoubleClick = this.handleTracklistDoubleClick.bind(this);
    this.itemRenderer = this.itemRenderer.bind(this);
    this.itemSizeGetter = this.itemSizeGetter.bind(this);
    this.moveAlbum = this.moveAlbum.bind(this);
    this.playTrack = this.playTrack.bind(this);
  }
  componentDidMount() {
    this.list.getScrollParent().addEventListener('scroll', this._onListScrollHandler);
    if (this.props.playlist.lastScrolledAlbumId) {
      this.scrollTo(this.props.playlist.lastScrolledAlbumId);
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      list: getFlattenedList(nextProps, this.props.currentTrack),
    });
  }
  componentDidUpdate() {
    if (this.props.lastAction === null && this.props.playlist.lastScrolledAlbumId) {
      this.scrollAround(this.props.playlist.lastScrolledAlbumId);
    }
  }
  componentWillUnmount() {
    this.list.getScrollParent().removeEventListener('scroll', this._onListScrollHandler);
    this.props.playlist.openAlbums = this.props.openElements;
  }
  itemRenderer(index) {
    const item = this.state.list[index];
    switch (item.type) {
      case 'album': {
        const album = item.album;
        return (
          <AlbumPlaylistItem
            key={album.id}
            index={item.index}
            itemKey={album.id}
            album={album}
            baseFontSize={this.props.baseFontSize}
            playlist={this.props.playlist}
            closeElements={this.props.closeElements}
            handleClick={this.handleClick}
            handleFolderDrop={handleFolderDrop}
            handleDragEnd={this.handleDragEnd}
            playTrack={this.playTrack}
            currentTrack={this.props.currentTrack || {}}
            moveAlbum={this.moveAlbum}
            direction={this.props.direction}
            isSelected={item.isSelected}
            isOpened={item.isOpened}
          />
        );
      }
      case 'track': {
        const track = item.track;
        return (
          <AlbumTracklistItem
            key={track.id}
            itemKey={track.id}
            album={item.album}
            playlist={this.props.playlist}
            track={track}
            index={item.index}
            isSelected={item.isSelected}
            isPlaying={item.isPlaying}
            handleClick={this.handleTracklistClick}
            handleDoubleClick={this.handleTracklistDoubleClick}
            useTranslate3d
          />
        );
      }
      case 'discNumber':
        return (
          <li key={item.key} className="disc-number">
            {i18n.t('playlist.album.disc', { disc: item.disc })}
          </li>
        );
      default:
        return null;
    }
  }
  itemSizeGetter(index) {
    const item = this.state.list[index];
    if (!item) {
      return 0;
    }
    switch (item.type) {
      case 'album':
        return 4 * this.props.baseFontSize;
      case 'track':
      case 'discNumber':
        return 2 * this.props.baseFontSize;
      default:
        return 1 * this.props.baseFontSize;
    }
  }
  _onListScrollHandler() {
    return debounce(() => {
      if (!this.list) {
        return;
      }
      const index = this.list.getVisibleRange()[0];
      if (!index) {
        return;
      }
      const lastScrolledAlbum = this.state.list[index];
      this.props.playlist.lastScrolledAlbumId = lastScrolledAlbum.id;
    }, 100);
  }
  handleGlobalClick() {
    this.setState({ openMenu: null });
  }
  handleClick(event, item) {
    this.props.handleClick(event, item);
  }
  handleTracklistClick(event, item) {
    event.stopPropagation();
    this.props.handleClick(event, item);
  }
  handleTracklistDoubleClick(event, item) {
    event.stopPropagation();
    if (!item.props.track.disabled) {
      this.playTrack(item.props.album, item.props.track.id);
    }
  }
  handleDragEnd() {
    const node = ReactDOM.findDOMNode(this);  // eslint-disable-line
    forEach(
      node.querySelectorAll('.drag-over'),
      e => e.classList.remove('drag-over', 'drag-over-bottom', 'drag-over-top'),
    );
    node.querySelector('.drop-area').classList.remove('over');
  }
  moveAlbum(id, afterId, position) {
    const after = afterId || this.props.playlist.getLast().id;
    if (id !== after) {
      OpenPlaylistActions.reorder(this.props.playlist.id, id, afterId, position);
    }
  }
  playTrack(album, trackId) {
    OpenPlaylistActions.selectAlbum(album, trackId, this.props.playlist, true);
  }
  calculateDropAreaHeight() {
    const height = this.state.list.reduce(
      (memo, item, index) => memo + this.itemSizeGetter(index),
      0
    );
    return `calc(100vh - 9rem - ${height}px`;
  }
  scrollAround(id) {
    const index = findIndex(this.state.list, item => item.id === id);
    if (index > -1) {
      this.list.scrollAround(index);
    }
  }
  scrollTo(id) {
    const index = findIndex(this.state.list, item => item.id === id);
    if (index > -1) {
      this.list.scrollTo(index);
    }
  }
  render() {
    const classes = cx({
      'playlist-content': true,
      loading: !this.props.playlist.loaded,
    });
    return (
      <div onClick={this.handleGlobalClick} className={classes}>
        <i className="fa fa-circle-o-notch fa-spin load-icon" />
        <ReactList
          itemRenderer={this.itemRenderer}
          itemsRenderer={itemsRenderer}
          itemSizeGetter={this.itemSizeGetter}
          length={this.state.list.length}
          threshold={SCROLL_THRESHOLD}
          type="variable"
          ref={(c) => { this.list = c; }}
          list={this.state.list}
          currentTrack={this.props.currentTrack}
          selection={this.props.selection}
          openElements={this.props.openElements}
        />
        <DropArea
          height={this.calculateDropAreaHeight()}
          moveAlbum={this.moveAlbum}
          handleFolderDrop={handleFolderDrop}
          handleDragEnd={this.handleDragEnd}
        />
      </div>
    );
  }
}

AlbumPlaylist.propTypes = {
  baseFontSize: PropTypes.number,
  direction: PropTypes.number,
  lastAction: PropTypes.string,
  playlist: PropTypes.shape({
    id: PropTypes.string,
    getLast: PropTypes.func,
    lastScrolledAlbumId: PropTypes.string,
    loaded: PropTypes.bool,
    openAlbums: PropTypes.arrayOf({
      id: PropTypes.string,
    }),
  }),
  closeElements: PropTypes.func,
  handleClick: PropTypes.func,
  openElements: PropTypes.arrayOf({
    id: PropTypes.string,
  }),
  selection: PropTypes.arrayOf({
    id: PropTypes.string,
  }),
  currentTrack: PropTypes.shape({
    id: PropTypes.string,
  }),
};

export default AlbumPlaylist;
