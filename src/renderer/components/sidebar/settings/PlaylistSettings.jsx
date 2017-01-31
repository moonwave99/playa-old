import React, { PropTypes, Component } from 'react';
import i18n from 'i18next';
import SettingsActions from '../../../actions/SettingsActions';

class PlaylistSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autosave: props.settings.user.autosave,
    };
    this.handleAutosaveChange = this.handleAutosaveChange.bind(this);
  }
  handleAutosaveChange() {
    SettingsActions.set('user', 'autosave', !this.state.autosave);
    this.setState({
      autosave: !this.state.autosave,
    });
  }
  render() {
    return (
      <form className="settings-block">
        <h2>
          <i className="fa fa-fw fa-file-audio-o" />
          {i18n.t('sidebar.settings.playlist.title')}
        </h2>
        <div className="checkbox">
          <label htmlFor="autosave">
            <input
              id="autosave"
              type="checkbox"
              checked={this.state.autosave}
              onChange={this.handleAutosaveChange}
            />
            {i18n.t('sidebar.settings.playlist.autosave')}
          </label>
        </div>
      </form>
    );
  }
}

PlaylistSettings.propTypes = {
  settings: PropTypes.shape({
    user: PropTypes.shape({
      autosave: PropTypes.bool,
    }),
  }),
};

export default PlaylistSettings;
