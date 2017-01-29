'use babel';

import { contains, find } from 'lodash';
import md5 from 'md5';
import i18n from 'i18next';
import React, { PropTypes, Component } from 'react';
import FileBrowser from './FileBrowser.jsx';
import navGenerator from '../../generators/Navigable.jsx';
import AlbumPlaylist from '../../util/AlbumPlaylist';
import PlaylistBrowserStore from '../../stores/PlaylistBrowserStore';
import PlaylistBrowserActions from '../../actions/PlaylistBrowserActions';
import OpenPlaylistActions from '../../actions/OpenPlaylistActions';
import KeyboardFocusActions from '../../actions/KeyboardFocusActions';
import KeyboardNameSpaceConstants from '../../constants/KeyboardNameSpaceConstants';
import ContextMenuActions from '../../actions/ContextMenuActions';
import ModalActions from '../../actions/ModalActions';

const FileBrowserOnSteroids = navGenerator(FileBrowser, KeyboardNameSpaceConstants.PLAYLIST_BROWSER,
  component => component.props.tree.map(({ id }) => id),
  component => find(component.props.tree, { id: component.state.selection[0] }),
  null,
  (component, buffer) => {
    const result = find(component.props.tree,
      x => x.name.toLowerCase().startsWith(buffer)
    ) || {};
    return result.id;
  }
);

const openPlaylist = function openPlaylist(playlistPath) {
  const playlist = new AlbumPlaylist({ id: md5(playlistPath), path: playlistPath });
  OpenPlaylistActions.add([playlist], { silent: true });
  OpenPlaylistActions.selectById(playlist.id);
};

const handleArrowClick = function handleArrowClick(event, item) {
  if (item.props.collapsed) {
    PlaylistBrowserActions.expandNodes([item.props.node]);
  } else {
    PlaylistBrowserActions.collapseNodes([item.props.node]);
  }
};

const handleGlobalClick = function handleGlobalClick() {
  KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.PLAYLIST_BROWSER);
};

const handleDelete = function handleDelete(node) {
  const currentPlaylist = playa.openPlaylistManager.findBy('title', node.name);
  if (currentPlaylist) {
    alert(i18n.t('sidebar.playlist.delete.cannotDelete'));
  } else if (confirm(i18n.t('sidebar.playlist.delete.confirm', { name: node.name }))) {
    PlaylistBrowserActions.deletePlaylist(node);
  }
};

const handleRename = function handleRename(item, newName) {
  if (item.name !== newName) {
    const playlist = playa.openPlaylistManager.findBy('title', item.name) || new AlbumPlaylist({
      title: item.name,
      path: item.path,
      id: md5(item.path),
    });
    playlist.rename(newName).then(() => {
      OpenPlaylistActions.update(playlist.id, {
        title: playlist.title,
        path: playlist.path,
      });
      PlaylistBrowserActions.loadRoot();
      ModalActions.hide();
    }).catch(() => alert(i18n.t('sidebar.playlist.rename.fileExists')));
  }
};

const handleEnterKeyPress = function handleEnterKeyPress(event, item) {
  if (item.state.selection.length === 1) {
    openPlaylist(item.getSelectedElement().path);
  }
};

const getContextMenuActions = function getContextMenuActions(item) {
  return [
    {
      label: i18n.t('sidebar.playlist.contextMenu.load'),
      handler: () => {
        if (!item.props.node.isDirectory()) {
          openPlaylist(item.props.node.path);
        }
      },
    },
    {
      label: i18n.t('sidebar.playlist.contextMenu.rename'),
      handler: () =>
        ModalActions.show({
          component: 'Rename',
          item: item.props.node,
          handleSubmit: handleRename,
          isDismissable: true,
        }),
    },
    {
      label: i18n.t('sidebar.playlist.contextMenu.delete'),
      handler: handleDelete.bind(null, item.props.node),
    },
  ];
};

const handleDoubleClick = function handleDoubleClick(event, item) {
  if (!item.props.node.isDirectory()) {
    openPlaylist(item.props.node.path);
  }
};

const handleContextMenu = function handleContextMenu(event, item) {
  ContextMenuActions.show(
    getContextMenuActions(item),
    { top: event.clientY, left: event.clientX },
    event,
    KeyboardNameSpaceConstants.PLAYLIST_BROWSER,
  );
};

class PlaylistBrowserTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playlistTree: PlaylistBrowserStore.getPlaylistTree(),
    };
    this.handleScrollToElement = this.handleScrollToElement.bind(this);
    this.handleDelKeyPress = this.handleDelKeyPress.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onPlaylistBrowserChange = this.onPlaylistBrowserChange.bind(this);
  }
  componentDidMount() {
    PlaylistBrowserStore.addChangeListener(this.onPlaylistBrowserChange);
  }
  componentWillUnmount() {
    PlaylistBrowserStore.removeChangeListener(this.onPlaylistBrowserChange);
  }
  _getNodesById(ids) {
    return this.state.playlistTree.filter(node => contains(ids, node.id) && node.isDirectory());
  }
  handleDelKeyPress(event, item, elementsToRemove) {
    if (elementsToRemove.length > 1) {
      return;
    }
    const node = find(this.state.playlistTree, n => n.id === elementsToRemove[0]);
    if (node) {
      handleDelete(node);
    }
  }
  handleScrollToElement(state, list) {
    this.props.handleScrollToElement(state, list);
  }
  handleOpen(ids) {
    const nodes = this._getNodesById(ids);
    if (nodes.length) {
      PlaylistBrowserActions.expandNodes(nodes);
    }
  }
  handleClose(ids) {
    const nodes = this._getNodesById(ids);
    if (nodes.length) {
      PlaylistBrowserActions.collapseNodes(nodes);
    }
  }
  onPlaylistBrowserChange() {
    this.setState({
      playlistTree: PlaylistBrowserStore.getPlaylistTree(),
    });
  }
  render() {
    return (
      <div onClick={handleGlobalClick}>
        <FileBrowserOnSteroids
          allowMultipleSelection
          handleDelKeyPress={this.handleDelKeyPress}
          handleEnterKeyPress={handleEnterKeyPress}
          handleScrollToElement={this.handleScrollToElement}
          handleDoubleClick={handleDoubleClick}
          handleArrowClick={handleArrowClick}
          handleContextMenu={handleContextMenu}
          handleOpen={this.handleOpen}
          handleClose={this.handleClose}
          isFocused={this.props.isFocused}
          tree={this.state.playlistTree}
        />
      </div>
    );
  }
}

PlaylistBrowserTab.propTypes = {
  handleScrollToElement: PropTypes.func,
  isFocused: PropTypes.bool,
};

module.exports = PlaylistBrowserTab;
