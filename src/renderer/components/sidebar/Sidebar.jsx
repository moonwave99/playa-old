'use babel';

import cx from 'classnames';
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import Tabs from 'react-simpletabs';
import PlaylistBrowserTab from './PlaylistBrowserTab.jsx';
import FileBrowserTab from './FileBrowserTab.jsx';
import SettingsTab from './settings/SettingsTab.jsx';
import SidebarActions from '../../actions/SidebarActions';
import KeyboardFocusActions from '../../actions/KeyboardFocusActions';
import KeyboardNameSpaceConstants from '../../constants/KeyboardNameSpaceConstants';
import { overflowsParent } from '../../util/helpers/overflow';

const handleAfter = function handleAfter(selectedIndex) {
  SidebarActions.select(selectedIndex - 1);
  setTimeout(() => KeyboardFocusActions.requestFocus(
    KeyboardNameSpaceConstants[
      selectedIndex === 1 ? 'PLAYLIST_BROWSER' : 'FILE_BROWSER'
    ]
  ), 100);
};

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.handleScrollToElement = this.handleScrollToElement.bind(this);
  }
  handleScrollToElement(state, list) {
    const wrapper = ReactDOM.findDOMNode(this).querySelector('.tab-panel'); // eslint-disable-line
    const targetElement = wrapper.querySelector(`[data-id="${state.selection[0]}"]`);
    if (!targetElement) {
      return;
    }
    const { direction, parentBounds, elBounds } = overflowsParent(wrapper, targetElement);
    if (direction < 0) {
      wrapper.scrollTop = targetElement.offsetTop;
    } else if (direction > 0) {
      const maxEls = Math.floor(parentBounds.height / elBounds.height);
      wrapper.scrollTop = (list.indexOf((state.selection[0]) - maxEls) + 1) * elBounds.height;
    }
  }
  renderTabs() {
    return [
      <Tabs.Panel title={<i className="fa fa-fw fa-file-audio-o" />} key="playlists">
        <PlaylistBrowserTab
          handleScrollToElement={this.handleScrollToElement}
          isFocused={this.props.isOpen && this.props.selectedTab === 0}
        />
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-folder-open-o" />} key="files">
        <FileBrowserTab
          handleScrollToElement={this.handleScrollToElement}
          isFocused={this.props.isOpen && this.props.selectedTab === 1}
        />
      </Tabs.Panel>,
      <Tabs.Panel title={<i className="fa fa-fw fa-cog" />} key="settings">
        <SettingsTab
          isFocused={this.props.isOpen && this.props.selectedTab === 2}
          settings={this.props.settings}
          lastFMClient={this.props.lastFMClient}
        />
      </Tabs.Panel>,
    ];
  }
  render() {
    const classes = cx({
      sidebar: true,
      'sidebar-left': true,
      open: this.props.isOpen,
    });
    return (
      <div className={classes}>
        <Tabs
          tabActive={this.props.selectedTab + 1}
          onAfterChange={handleAfter}
        >
          {this.renderTabs()}
        </Tabs>
      </div>
    );
  }
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  selectedTab: PropTypes.number,
  lastFMClient: PropTypes.shape({}),
  settings: PropTypes.shape({}),
};

module.exports = Sidebar;
