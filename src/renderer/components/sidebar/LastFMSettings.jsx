'use babel';

import React, { PropTypes, Component } from 'react';
import i18n from 'i18next';
import SettingsActions from '../../actions/SettingsActions';
import { openLastfmUser } from '../../util/helpers/openLink';

class LastFMSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrobbleEnabled: props.settings.user.scrobbleEnabled,
      isAuthorised: props.lastFMClient.isAuthorised(),
    };
    this.handleScrobbleChange = this.handleScrobbleChange.bind(this);
    this.handleAuthoriseClick = this.handleAuthoriseClick.bind(this);
    this.handleSignoutClick = this.handleSignoutClick.bind(this);
    this.handleLastFMUserClick = this.handleLastFMUserClick.bind(this);
    this._onLastFMCLientAuthorisationChange = this._onLastFMCLientAuthorisationChange.bind(this);
  }
  componentDidMount() {
    this.props.lastFMClient.on('authorised', this._onLastFMCLientAuthorisationChange);
    this.props.lastFMClient.on('signout', this._onLastFMCLientAuthorisationChange);
  }
  componentWillUnmount() {
    this.props.lastFMClient.removeListener('authorised', this._onLastFMCLientAuthorisationChange);
    this.props.lastFMClient.removeListener('signout', this._onLastFMCLientAuthorisationChange);
  }
  handleLastFMUserClick(event) {
    event.preventDefault();
    openLastfmUser(this.props.lastFMClient.session.user);
  }
  handleAuthoriseClick() {
    this.props.lastFMClient.authorise();
  }
  handleSignoutClick() {
    this.props.lastFMClient.signout();
  }
  handleScrobbleChange() {
    SettingsActions.set('user', 'scrobbleEnabled', !this.state.scrobbleEnabled);
    this.setState({
      scrobbleEnabled: !this.state.scrobbleEnabled,
    });
  }
  _onLastFMCLientAuthorisationChange() {
    this.setState({
      isAuthorised: this.props.lastFMClient.isAuthorised(),
    });
  }
  renderUserInfo() {
    if (this.state.isAuthorised) {
      const user = this.props.lastFMClient.session.user;
      return (
        <div>
          <p>
            {i18n.t('sidebar.settings.lastfm.signedin')}
            <button
              className="btn-transparent"
              onClick={this.handleLastFMUserClick}
              title={i18n.t('sidebar.settings.lastfm.visit', { user })}
            >
              <strong>{user}</strong>
            </button>
          </p>
          <p>
            <button
              className="btn btn-default btn-sm btn-block"
              onClick={this.handleSignoutClick}
            >
              <i className="fa fa-sign-out" />
              {i18n.t('sidebar.settings.lastfm.signout')}
            </button>
          </p>
        </div>
      );
    }
    return (
      <button
        className="btn btn-default btn-sm btn-block"
        onClick={this.handleAuthoriseClick}
      >
        <i className="fa fa-sign-in" />
        {i18n.t('sidebar.settings.lastfm.authorise')}
      </button>
    );
  }
  render() {
    return (
      <form className="settings-block">
        <h2>
          <i className="fa fa-fw fa-lastfm" />
          {i18n.t('sidebar.settings.lastfm.title')}
        </h2>
        <div className="checkbox">
          <label htmlFor="scrobble">
            <input
              type="checkbox"
              id="scrobble"
              checked={this.state.scrobbleEnabled}
              onChange={this.handleScrobbleChange}
            />
            {i18n.t('sidebar.settings.lastfm.enable')}
          </label>
        </div>
        { this.renderUserInfo() }
      </form>
    );
  }
}

LastFMSettings.propTypes = {
  settings: PropTypes.shape({
    user: PropTypes.shape({
      scrobbleEnabled: PropTypes.bool,
    }),
  }),
  lastFMClient: PropTypes.shape({
    isAuthorised: PropTypes.func,
    authorise: PropTypes.func,
    signout: PropTypes.func,
    on: PropTypes.func,
    removeListener: PropTypes.func,
    session: PropTypes.shape({
      user: PropTypes.string,
    }),
  }),
};

module.exports = LastFMSettings;
