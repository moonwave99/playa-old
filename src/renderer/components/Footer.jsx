import React, { PropTypes, Component } from 'react';
import cx from 'classnames';
import { ipcRenderer as ipc } from 'electron';
import i18n from 'i18next';
import InfoDrawer from './InfoDrawer';
import { formatTimeLong } from '../util/helpers/formatters';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioInfo: null,
    };
    this.handleInfoIconClick = this.handleInfoIconClick.bind(this);
    this.handleErrorIconClick = this.handleErrorIconClick.bind(this);
    this._onPlaylistInfoToggle = this._onPlaylistInfoToggle.bind(this);
  }
  componentDidMount() {
    ipc.on('playlist:toggleInfo', this._onPlaylistInfoToggle);
  }
  componentWillUnmount() {
    ipc.removeListener('playlist:toggleInfo', this._onPlaylistInfoToggle);
  }
  playlistDescription() {
    if (!this.props.selectedPlaylist) {
      return i18n.t('footer.noPlaylist');
    }
    const { albums, tracks, totalTime } = this.props.selectedPlaylist.getStats();
    return (tracks === 0)
      ? i18n.t('footer.emptyPlaylist')
      : i18n.t('footer.stats', {
        albums,
        tracks,
        totalTime: formatTimeLong(totalTime),
      });
  }
  handleInfoIconClick() {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen,
    });
  }
  handleErrorIconClick() {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen,
    });
  }
  _onPlaylistInfoToggle() {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen,
    });
  }
  render() {
    const footerClasses = cx({
      footer: true,
      isDrawerOpen: this.state.isDrawerOpen,
    });
    const iconClasses = cx({
      'list-inline': true,
      'pull-right': true,
      icons: true,
      hidden: !this.props.selectedPlaylist,
    });
    const errorIconClasses = cx({
      fa: true,
      'fa-fw': true,
      'fa-exclamation-circle': true,
      'error-icon': true,
      hidden: true,
    });
    return (
      <footer className={footerClasses}>
        <div className="footer-top-bar">
          <span className="count">{this.playlistDescription()}</span>
          <ul className={iconClasses}>
            <li>
              <button onClick={this.handleErrorIconClick}>
                <i className={errorIconClasses} />
              </button>
            </li>
            <li>
              <button onClick={this.handleInfoIconClick}>
                <i className="fa fa-fw fa-info" />
              </button>
            </li>
          </ul>
        </div>
        <InfoDrawer audioMetadata={this.props.audioMetadata} />
      </footer>
    );
  }
}

Footer.propTypes = {
  selectedPlaylist: PropTypes.shape({
    getStats: PropTypes.func,
  }),
  audioMetadata: PropTypes.shape({}),
};

export default Footer;
