import { ipcRenderer as ipc } from 'electron';
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import { DragSource as dragSource, DropTarget as dropTarget } from 'react-dnd';
import cx from 'classnames';
import i18n from 'i18next';
import DragDropConstants from '../../constants/DragDropConstants';
import ContextMenuActions from '../../actions/ContextMenuActions';
import KeyboardNameSpaceConstants from '../../constants/KeyboardNameSpaceConstants';
import OpenPlaylistActions from '../../actions/OpenPlaylistActions';
import { revealInFinder,
  searchOnDiscogs,
  searchOnRym,
  searchOnLastfm
} from '../../util/helpers/openLink';

const DRAGGING_OPACITY = 0.4;

const albumSource = {
  beginDrag(props) {
    return {
      id: props.itemKey,
      originalIndex: props.index,
      source: DragDropConstants.PLAYLIST_ALBUM,
    };
  },
  endDrag(props, monitor) {
    const didDrop = monitor.didDrop();
    if (!didDrop) {
      props.handleDragEnd();
    }
  },
};

const albumTarget = {
  drop(props, monitor) {
    const sourceItem = monitor.getItem();
    switch (sourceItem.source) {
      case DragDropConstants.FILEBROWSER_FOLDER:
        props.handleFolderDrop(sourceItem.node.path, props.itemKey);
        break;
      case DragDropConstants.PLAYLIST_ALBUM: {
        const draggedId = monitor.getItem().id;
        if (draggedId !== props.id) {
          props.moveAlbum(
            draggedId,
            props.itemKey,
            props.index < monitor.getItem().originalIndex
              ? 'before'
              : 'after',
          );
        }
        break;
      }
      default:
        break;
    }
    props.handleDragEnd();
  },
  hover(props, monitor, component) {
    props.handleDragEnd();
    ReactDOM.findDOMNode(component) // eslint-disable-line
      .classList.add(
        'drag-over',
        props.index < monitor.getItem().originalIndex
          ? 'drag-over-top'
          : 'drag-over-bottom',
      );
  },
};

class AlbumPlaylistItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cover: null,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleMenuLinkClick = this.handleMenuLinkClick.bind(this);
    this.updateCover = this.updateCover.bind(this);
  }
  componentWillMount() {
    if (this.props.album.disabled) {
      return;
    }
    playa.coverLoader.load(this.props.album)
      .then(this.updateCover)
      .catch(() => {});
  }
  getDisabledContextMenuActions() {
    return [
      {
        label: 'Locate Folder',
        handler: () => {
          const folder = this.props.album.getFolder();
          const remoteFolder = ipc.sendSync('request:open:dialog', {
            title: i18n.t('playlist.album.contextMenu.locateFolder', { folder }),
            properties: ['openDirectory'],
          });
          if (remoteFolder[0]) {
            OpenPlaylistActions.locateFolder(
              this.props.playlist.id,
              this.props.album.id,
              remoteFolder[0],
            );
          }
        },
      },
    ];
  }
  getContextMenuActions() {
    const queryTerm = `${this.props.album.getArtist()}' '${this.props.album.getTitle()}`;
    return [
      {
        label: i18n.t('playlist.album.contextMenu.finder'),
        handler: () => revealInFinder(this.props.album.getFolder()),
      },
      {
        label: i18n.t('playlist.album.contextMenu.discogs'),
        handler: () => searchOnDiscogs(queryTerm),
      },
      {
        label: i18n.t('playlist.album.contextMenu.rym'),
        handler: () => searchOnRym(queryTerm),
      },
      {
        label: i18n.t('playlist.album.contextMenu.lastfm'),
        handler: () => searchOnLastfm(queryTerm),
      },
    ];
  }
  handleMenuLinkClick(event) {
    event.stopPropagation();
    ContextMenuActions.show(
      this.props.album.disabled
        ? this.getDisabledContextMenuActions()
        : this.getContextMenuActions(),
      { top: event.clientY, left: event.clientX - (10 * this.props.baseFontSize) },
      event,
      KeyboardNameSpaceConstants.ALBUM_PLAYLIST,
    );
  }
  handleDoubleClick(event) {
    event.stopPropagation();
    if (!this.props.album.disabled) {
      this.props.playTrack(this.props.album, this.props.album.tracks[0].id);
    }
  }
  handleClick(event) {
    this.props.handleClick(event, this);
  }
  updateCover(cover) {
    this.setState({ cover });
  }
  render() {
    const isPlaying = this.props.album.contains(this.props.currentTrack.id);
    const classes = cx({
      album: true,
      playing: isPlaying,
      selected: this.props.isSelected,
      open: this.props.isOpened,
      disabled: this.props.album.disabled,
    });
    const opacity = this.props.isDragging ? DRAGGING_OPACITY : 1;
    const coverStyle = this.state.cover
      ? { backgroundImage: `url(${encodeURI(this.state.cover)})` }
      : {};
    const coverClasses = cx({
      cover: true,
      loaded: !!this.state.cover,
      menuOpened: this.props.isMenuOpened,
    });

    let output = null;

    if (this.props.album.disabled) {
      output = (
        <li
          className={classes}
          onClick={this.handleClick}
          onDoubleClick={this.handleDoubleClick}
          onContextMenu={this.handleMenuLinkClick}
          style={{ opacity }}
          data-id={this.props.album.id}
        >
          <div className={coverClasses} style={coverStyle} />
          <span className="folder">{this.props.album.getFolder()}</span>
          <button className="menu-link sidebar-offset" onClick={this.handleMenuLinkClick}>
            <i className="fa fa-fw fa-ellipsis-h" />
          </button>
          <button className="album-status album-error sidebar-offset">
            <i className="fa fa-fw fa-exclamation-circle" />
          </button>
        </li>
      );
    } else {
      const status = this.props.album.missingTracksCount() > 0
        ? (
          <button className="album-status album-warning sidebar-offset">
            <i className="fa fa-fw fa-exclamation-triangle" />
          </button>
        )
        : null;
      output = (
        <li
          className={classes}
          onClick={this.handleClick}
          onDoubleClick={this.handleDoubleClick}
          onContextMenu={this.handleMenuLinkClick}
          style={{ opacity }}
          data-id={this.props.album.id}
        >
          <div className={coverClasses} style={coverStyle} />
          <span className="artist">{this.props.album.getArtist()}</span><br />
          <span className="title">
            {this.props.album.getTitle()}
            { (isPlaying && !this.props.isOpened)
              ? <i className="fa fa-fw fa-volume-up" />
              : null
            }
          </span>
          {status}
          <button className="menu-link sidebar-offset" onClick={this.handleMenuLinkClick}>
            <i className="fa fa-fw fa-ellipsis-h" />
          </button>
          <span className="year sidebar-offset">{this.props.album.getYear()}</span>
        </li>
      );
    }
    return this.props.connectDragSource(this.props.connectDropTarget(output));
  }
}

AlbumPlaylistItem.propTypes = {
  album: PropTypes.shape({
    disabled: PropTypes.bool,
    id: PropTypes.string,
    missingTracksCount: PropTypes.func,
    getArtist: PropTypes.func,
    getFolder: PropTypes.func,
    getTitle: PropTypes.func,
    getYear: PropTypes.func,
    contains: PropTypes.func,
    tracks: PropTypes.arrayOf({
      id: PropTypes.string,
    }),
  }),
  currentTrack: PropTypes.shape({
    id: PropTypes.string,
  }),
  playlist: PropTypes.shape({
    id: PropTypes.string,
  }),
  baseFontSize: PropTypes.number,
  handleClick: PropTypes.func,
  playTrack: PropTypes.func,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  isDragging: PropTypes.bool,
  isOpened: PropTypes.bool,
  isSelected: PropTypes.bool,
  isMenuOpened: PropTypes.bool,
};

const DroppedAlbumPlaylistItem = dropTarget([
  DragDropConstants.PLAYLIST_ALBUM,
  DragDropConstants.FILEBROWSER_FOLDER,
], albumTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(AlbumPlaylistItem);

const DraggedAndDroppedPlaylistItem = dragSource(
  DragDropConstants.PLAYLIST_ALBUM,
  albumSource,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(DroppedAlbumPlaylistItem);

export default DraggedAndDroppedPlaylistItem;
