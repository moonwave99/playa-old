import { ipcRenderer as ipc } from 'electron';
import React, { PropTypes, Component } from 'react';
import i18n from 'i18next';
import SettingsActions from '../../../actions/SettingsActions';

const renderRemoteLink = function renderRemoteLink(remoteLink) {
  return (
    <span>Address:
      <strong className="btn-transparent">{remoteLink}</strong>
    </span>
  );
};

class RemoteSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allowRemote: props.settings.user.allowRemote,
      remoteLink: ipc.sendSync('remote:getAddress'),
    };
    this.handleRemoteChange = this.handleRemoteChange.bind(this);
  }
  handleRemoteChange() {
    SettingsActions.set('user', 'allowRemote', !this.state.allowRemote);
    this.setState({
      allowRemote: !this.state.allowRemote,
    });
    if (ipc.sendSync('remote:isActive')) {
      ipc.sendSync('remote:stop');
    } else {
      ipc.sendSync('remote:start', { playa });
    }
  }
  render() {
    return (
      <form className="settings-block">
        <h2>
          <i className="fa fa-fw fa-play-circle-o" />
          {i18n.t('sidebar.settings.remote.title')}
        </h2>
        <div className="checkbox">
          <label htmlFor="remote">
            <input
              type="checkbox"
              id="remote"
              checked={this.state.allowRemote}
              onChange={this.handleRemoteChange}
            />
            {i18n.t('sidebar.settings.remote.allow')}
          </label>
        </div>
        { this.state.allowRemote ? renderRemoteLink(this.state.remoteLink) : null }
      </form>
    );
  }
}

RemoteSettings.propTypes = {
  settings: PropTypes.shape({
    user: PropTypes.shape({
      allowRemote: PropTypes.bool,
    }),
  }),
};

export default RemoteSettings;
