'use babel';

import { contains, reduce } from 'lodash';
import React, { PropTypes, Component } from 'react';
import cx from 'classnames';
import AlbumPlaylist from './AlbumPlaylist.jsx';
import OpenPlaylistActions from '../../actions/OpenPlaylistActions';
import PlayerStore from '../../stores/PlayerStore';
import KeyboardFocusActions from '../../actions/KeyboardFocusActions';
import navGenerator from '../../generators/Navigable.jsx';
import KeyboardNameSpaceConstants from '../../constants/KeyboardNameSpaceConstants';

const AlbumPlaylistOnSteroids = navGenerator(
  AlbumPlaylist,
  KeyboardNameSpaceConstants.ALBUM_PLAYLIST,
  component =>
    reduce(component.props.playlist.getItems(), (memo, album) => {
      let ids = [];
      ids.push(album.id);
      if (contains(component.state.openElements, album.id)) {
        ids = ids.concat(album.tracks.map(t => t.id));
      }
      return memo.concat(ids);
    }, [])
  ,
  (component) => {
    if (component.state.selection[0].startsWith('a_')) {
      const album = component.props.playlist.getAlbumById(component.state.selection[0]);
      return {
        album,
        trackId: album.tracks[0].id,
      };
    }
    return {
      album: component.props.playlist.getAlbumByTrackId(component.state.selection[0]),
      trackId: component.state.selection[0],
    };
  },
  null,
  (component, buffer) => {
    const result = component.props.playlist.find(buffer) || {};
    return result.id;
  },
);

const getPlayerState = function getPlayerState() {
  const playerState = PlayerStore.getPlaybackInfo();
  return {
    currentTrack: playerState.currentTrack || {},
  };
};

const handleDelKeyPress = function handleDelKeyPress(event, item, tracksToRemove) {
  OpenPlaylistActions.removeFiles(tracksToRemove, item.props.playlist);
};
const handleGlobalClick = function handleGlobalClick() {
  KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.ALBUM_PLAYLIST);
};

const handleScrollToElement = function handleScrollToElement(state, list, component) {
  if (!state.selection[0]) {
    return;
  }
  component.scrollAround(state.selection[0]);
};

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTrack: {},
    };
    this.handleEnterKeyPress = this.handleEnterKeyPress.bind(this);
    this._onPlayerChange = this._onPlayerChange.bind(this);
  }
  componentDidMount() {
    PlayerStore.addChangeListener(this._onPlayerChange);
    if (!this.props.playlist.loaded) {
      OpenPlaylistActions.load(this.props.playlist.id);
    }
  }
  componentWillUnmount() {
    PlayerStore.removeChangeListener(this._onPlayerChange);
  }
  handleEnterKeyPress(event, item) {
    if (item.state.selection.length !== 1) {
      return;
    }
    const whatToPlay = item.getSelectedElement();
    OpenPlaylistActions.selectAlbum(
      whatToPlay.album,
      whatToPlay.trackId,
      this.props.playlist,
      true,
    );
  }
  _onPlayerChange() {
    const playerState = getPlayerState();
    if (playerState.currentTrack.id !== this.state.currentTrack.id) {
      this.setState(playerState);
    }
  }
  render() {
    const classes = cx({
      playlist: true,
      'sidebar-open': !!this.props.isSidebarOpen,
    });
    return (
      <div className={classes} onClick={handleGlobalClick}>
        <AlbumPlaylistOnSteroids
          allowMultipleSelection
          currentTrack={this.state.currentTrack}
          playlist={this.props.playlist}
          baseFontSize={this.props.baseFontSize}
          initSelection={[this.props.playlist.lastScrolledAlbumId]}
          initOpenElements={this.props.playlist.openAlbums}
          handleDelKeyPress={handleDelKeyPress}
          handleEnterKeyPress={this.handleEnterKeyPress}
          handleScrollToElement={handleScrollToElement}
        />
      </div>
    );
  }
}

Playlist.propTypes = {
  isSidebarOpen: PropTypes.bool,
  baseFontSize: PropTypes.number,
  playlist: PropTypes.shape({
    id: PropTypes.string,
    loaded: PropTypes.bool,
    lastScrolledAlbumId: PropTypes.string,
    openAlbums: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default Playlist;
