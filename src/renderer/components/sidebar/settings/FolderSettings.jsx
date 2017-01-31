import React, { PropTypes, Component } from 'react';
import i18n from 'i18next';
import SettingsActions from '../../../actions/SettingsActions';

const setCustomAttributes = function setCustomAttributes(input) {
  if (!input) {
    return;
  }
  input.setAttribute('webkitdirectory', '');
  input.setAttribute('directory', '');
};

class FolderSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileBrowserRoot: this.props.settings.user.fileBrowserRoot,
    };
    this.handleFolderChange = this.handleFolderChange.bind(this);
  }
  handleFolderChange(event) {
    const folders = event.currentTarget.files;
    if (!folders.length) {
      return;
    }
    SettingsActions.set('user', 'fileBrowserRoot', folders[0].path);
    this.setState({
      fileBrowserRoot: folders[0].path,
    });
  }
  render() {
    return (
      <form className="settings-block">
        <h2>
          <i className="fa fa-fw fa-folder-o" />
          {i18n.t('sidebar.settings.folders.title')}
        </h2>
        <p>
          {i18n.t('sidebar.settings.folders.root')}
          <strong>{this.props.settings.user.fileBrowserRoot}</strong>
        </p>
        <p>
          <label htmlFor="fileBrowserRoot" className="btn btn-default btn-sm btn-block">
            <i className="fa fa-fw fa-folder-open" />
            {i18n.t('sidebar.settings.folders.change')}
          </label>
          <input
            type="file"
            onChange={this.handleFolderChange}
            className="hidden"
            id="fileBrowserRoot"
            ref={setCustomAttributes}
          />
        </p>
      </form>
    );
  }
}

FolderSettings.propTypes = {
  settings: PropTypes.shape({
    user: PropTypes.shape({
      fileBrowserRoot: PropTypes.string,
    }),
  }),
};

export default FolderSettings;
