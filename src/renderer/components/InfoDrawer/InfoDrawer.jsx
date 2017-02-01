import { map } from 'lodash';
import React, { PropTypes } from 'react';
import i18n from 'i18next';

const renderPlaceholder = function renderPlaceholder() {
  return (
    <p>{i18n.t('infoDrawer.placeholder')}</p>
  );
};

const renderCurrentTrackInfo = function renderCurrentTrackInfo(audioMetadata) {
  return (
    <ul className="list-unstyled track-info">
      {map(audioMetadata, (value, key) =>
        <li key={key}>
          <span className="key">{key.replace('_', ' ')}:</span>
          <span className="value">{value}</span>
        </li>,
      )},
    </ul>
  );
};

const infoDrawer = function infoDrawer({ audioMetadata }) {
  return (
    <div className="info-drawer">
      <h3>{i18n.t('infoDrawer.title')}</h3>
      { audioMetadata ? renderCurrentTrackInfo(audioMetadata) : renderPlaceholder() }
    </div>
  );
};

infoDrawer.propTypes = {
  audioMetadata: PropTypes.shape({}),
};

export default infoDrawer;
