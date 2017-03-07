import { range } from 'lodash';
import cx from 'classnames';
import key from 'keymaster';
import enquire from 'enquire.js';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Tabs from 'react-simpletabs';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { minWidth } from '../util/helpers/mediaQuery';
import Modal from './Modal.jsx';
import ContextMenu from './ContextMenu.jsx';
import PlaybackBar from './player/PlaybackBar.jsx';
import Playlist from './playlist/Playlist.jsx';
import Sidebar from './sidebar/Sidebar.jsx';
import Footer from './Footer.jsx';
import ModalStore from '../stores/ModalStore';
import PlayerStore from '../stores/PlayerStore';
import ContextMenuStore from '../stores/ContextMenuStore';
import OpenPlaylistStore from '../stores/OpenPlaylistStore';
import SidebarStore from '../stores/SidebarStore';
import SettingsStore from '../stores/SettingsStore';
import ContextMenuActions from '../actions/ContextMenuActions';
import OpenPlaylistActions from '../actions/OpenPlaylistActions';
import PlayerActions from '../actions/PlayerActions';
import KeyboardFocusActions from '../actions/KeyboardFocusActions';
import KeyboardNameSpaceConstants from '../constants/KeyboardNameSpaceConstants';

const getModalState = function getModalState() {
  return ModalStore.getInfo();
};

const getContextMenuState = function getContextMenuState() {
  return ContextMenuStore.getInfo();
};

const getSidebarState = function getSidebarState() {
  return SidebarStore.getInfo();
};

const getOpenPlaylistState = function getOpenPlaylistState() {
  return {
    openPlaylists: OpenPlaylistStore.getAll(),
    selectedPlaylist: OpenPlaylistStore.getSelectedPlaylist(),
    selectedIndex: OpenPlaylistStore.getSelectedIndex(),
  };
};

const getPlayerState = function getPlayerState() {
  return PlayerStore.getPlaybackInfo();
};

const getSettingsState = function getSettingsState() {
  return SettingsStore.getSettings();
};

const handleGlobalClick = function handleGlobalClick() {
  ContextMenuActions.hide();
};

const handleAfter = function handleAfter(selectedIndex) {
  OpenPlaylistActions.select(selectedIndex - 1);
};

const handleSpacePress = function handleSpacePress() {
  PlayerActions.toggle();
};

const unregisterCommonKeyHandler = function unregisterCommonKeyHandler() {
  key.unbind('space');
  range(9).forEach(n => key.unbind(`⌘+${n}`));
};

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      sidebar: getSidebarState(),
      contextMenu: getContextMenuState(),
      modal: getModalState(),
      settings: getSettingsState(),
      playerState: {},
      baseFontSize: this.props.baseFontSize.normal,
    }, getOpenPlaylistState());

    this.handleCommandNumberPress = this.handleCommandNumberPress.bind(this);
    this._onOpenPlaylistChange = this._onOpenPlaylistChange.bind(this);
    this._onPlayerChange = this._onPlayerChange.bind(this);
    this._onSidebarChange = this._onSidebarChange.bind(this);
    this._onContextMenuChange = this._onContextMenuChange.bind(this);
    this._onModalChange = this._onModalChange.bind(this);
    this._onSettingsChange = this._onSettingsChange.bind(this);
  }
  componentDidMount() {
    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange);
    PlayerStore.addChangeListener(this._onPlayerChange);
    SidebarStore.addChangeListener(this._onSidebarChange);
    ContextMenuStore.addChangeListener(this._onContextMenuChange);
    ModalStore.addChangeListener(this._onModalChange);
    SettingsStore.addChangeListener(this._onSettingsChange);
    this.registerMediaQueryHandler();
    this.registerCommonKeyHandler();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedIndex !== this.state.selectedIndex) {
      KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.ALBUM_PLAYLIST);
    }
    this.updateTabsWidth();
  }
  componentWillUnmount() {
    OpenPlaylistStore.removeChangeListener(this._onOpenPlaylistChange);
    PlayerStore.removeChangeListener(this._onPlayerChange);
    SidebarStore.removeChangeListener(this._onSidebarChange);
    ContextMenuStore.removeChangeListener(this._onContextMenuChange);
    ModalStore.removeChangeListener(this._onModalChange);
    SettingsStore.removeChangeListener(this._onSettingsChange);
    this.unregisterMediaQueryHandler();
    unregisterCommonKeyHandler();
  }
  handleCommandNumberPress(event) {
    const index = event.which - 48;
    if (index === 0) {
      OpenPlaylistActions.select(this.state.openPlaylists.length - 1);
    } else if (index <= this.state.openPlaylists.length) {
      OpenPlaylistActions.select(index - 1);
    }
  }
  _onOpenPlaylistChange() {
    this.setState(getOpenPlaylistState());
  }
  _onPlayerChange() {
    getPlayerState().then((playerState) => {
      const newId = playerState.currentTrack
        ? playerState.currentTrack.id
        : null;
      const oldId = this.state.playerState.currentTrack
        ? this.state.playerState.currentTrack.id
        : null;
      if (newId !== oldId) {
        this.setState({ playerState });
      }
    });
  }
  _onSidebarChange() {
    this.setState({ sidebar: getSidebarState() });
  }
  _onContextMenuChange() {
    this.setState({ contextMenu: getContextMenuState() });
  }
  _onModalChange() {
    this.setState({ modal: getModalState() });
  }
  _onSettingsChange() {
    this.setState({ settings: getSettingsState() });
  }
  registerCommonKeyHandler() {
    key('space', handleSpacePress);
    key(range(9).map(n => `⌘+${n}`).join(', '), this.handleCommandNumberPress);
  }
  registerMediaQueryHandler() {
    enquire.register(minWidth(this.props.breakpoints.widescreen), {
      match: () => {
        if (this.state.settings.user.openSidebar) {
          playa.toggleSidebar(true);
        }
      },
      unmatch: () => {},
    });
    enquire.register(minWidth(this.props.breakpoints.widefont), {
      match: () => this.setState({ baseFontSize: this.props.baseFontSize.wide }),
      unmatch: () => this.setState({ baseFontSize: this.props.baseFontSize.normal }),
    });
  }
  unregisterMediaQueryHandler() {
    enquire.unregister(minWidth(this.props.breakpoints.widescreen));
    enquire.unregister(minWidth(this.props.breakpoints.widefont));
  }
  updateTabsWidth() {
    const width = (
      ((this.state.openPlaylists.length - 1) * this.state.baseFontSize * 10)
      + (this.state.baseFontSize * 15)
    );
    ReactDOM.findDOMNode(this.tabs).querySelector('.tabs-menu').style.width = `${width}px`; // eslint-disable-line
  }
  render() {
    const baseFontSize = this.state.baseFontSize || this.props.baseFontSize.normal;
    const openPlaylists = this.state.openPlaylists.map(playlist => (
      <Tabs.Panel title={playlist.title} key={playlist.id}>
        <Playlist
          currentTrack={this.state.playerState.currentTrack}
          playlist={playlist}
          isSidebarOpen={this.state.sidebar.isOpen}
          baseFontSize={baseFontSize}
        />
      </Tabs.Panel>
    ));
    const audioMetadata = this.state.playerState.audioMetadata;
    const classes = cx({
      'playa-main': true,
      'sidebar-open': this.state.sidebar.isOpen,
    });
    return (
      <div className={classes} onClick={handleGlobalClick}>
        <Modal {...this.state.modal} />
        <PlaybackBar />
        <Sidebar
          lastFMClient={playa.lastFMClient}
          settings={this.state.settings}
          {...this.state.sidebar}
        />
        <div className="playa-main-wrapper">
          <Tabs
            ref={(c) => { this.tabs = c; }}
            tabActive={this.state.selectedIndex + 1}
            onAfterChange={handleAfter}
          >
            {openPlaylists}
          </Tabs>
        </div>
        <Footer
          audioMetadata={audioMetadata}
          selectedPlaylist={this.state.selectedPlaylist}
        />
        <ContextMenu {...this.state.contextMenu} />
      </div>
    );
  }
}

Main.propTypes = {
  baseFontSize: PropTypes.shape({
    normal: PropTypes.number,
    wide: PropTypes.number,
  }),
  breakpoints: PropTypes.shape({
    widescreen: PropTypes.string,
    widefont: PropTypes.string,
  }),
};

export default dragDropContext(HTML5Backend)(Main);
