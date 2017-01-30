'use babel';

import { map } from 'lodash';
import React, { Component } from 'react';
import cx from 'classnames';
import i18n from 'i18next';
import AudioMetadata from '../util/AudioMetadata';

const renderPlaceholder = function renderPlaceholder() {
  return (
    <p>{i18n.t('infoDrawer.placeholder')}</p>
  );
};

class InfoDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioInfo: null,
    };
  }
  componentWillReceiveProps() {
    const currentTrack = playa.player.currentTrack;
    if (!currentTrack) {
      return;
    }
    const metadata = new AudioMetadata(currentTrack.filename);
    metadata.load().then(() =>
      this.setState({ audioInfo: metadata.toJSON() })
    );
  }
  renderCurrentTrackInfo() {
    return (
      <ul className="list-unstyled track-info">
        {map(this.state.audioInfo, (value, key) =>
          <li key={key}>
            <span className="key">{key.replace('_', ' ')}:</span>
            <span className="value">{value}</span>
          </li>
        )}
      </ul>
    );
  }
  render() {
    const classes = cx({
      'info-drawer': true,
    });
    return (
      <div className={classes}>
        <h3>{i18n.t('infoDrawer.title')}</h3>
        { this.state.audioInfo ? this.renderCurrentTrackInfo() : renderPlaceholder() }
      </div>
    );
  }
}

export default InfoDrawer;
