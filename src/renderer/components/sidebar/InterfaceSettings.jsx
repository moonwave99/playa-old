'use babel';

import React, { PropTypes, Component } from 'react';
import i18n from 'i18next';
import SettingsActions from '../../actions/SettingsActions';

class InterfaceSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSidebar: props.settings.user.openSidebar,
    };
    this.handleSidebarChange = this.handleSidebarChange.bind(this);
  }
  handleSidebarChange() {
    SettingsActions.set('user', 'openSidebar', !this.state.openSidebar);
    this.setState({
      openSidebar: !this.state.openSidebar,
    });
  }
  render() {
    return (
      <form className="settings-block">
        <h2>
          <i className="fa fa-fw fa-mouse-pointer" />
          {i18n.t('sidebar.settings.interface.title')}
        </h2>
        <div className="checkbox">
          <label htmlFor="wideScreen">
            <input
              id="wideScreen"
              type="checkbox"
              checked={this.state.openSidebar}
              onChange={this.handleSidebarChange}
            />
            {i18n.t('sidebar.settings.interface.wideScreen')}
          </label>
        </div>
      </form>
    );
  }
}

InterfaceSettings.propTypes = {
  settings: PropTypes.shape({
    user: PropTypes.shape({
      openSidebar: PropTypes.bool,
    }),
  }),
};

module.exports = InterfaceSettings;
