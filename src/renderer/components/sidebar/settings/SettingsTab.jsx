import React, { PropTypes } from 'react';
import InterfaceSettings from './InterfaceSettings.jsx';
import PlaylistSettings from './PlaylistSettings.jsx';
import FolderSettings from './FolderSettings.jsx';
import LastFMSettings from './LastFMSettings.jsx';
import RemoteSettings from './RemoteSettings.jsx';

const settingsTab = function settingsTab(props) {
  return (
    <div className="settings">
      <InterfaceSettings settings={props.settings} />
      <PlaylistSettings settings={props.settings} />
      <FolderSettings settings={props.settings} />
      <LastFMSettings lastFMClient={props.lastFMClient} settings={props.settings} />
      <RemoteSettings settings={props.settings} />
    </div>
  );
};

settingsTab.propTypes = {
  settings: PropTypes.shape({}),
  lastFMClient: PropTypes.shape({}),
};

export default settingsTab;
