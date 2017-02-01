import { contains, find } from 'lodash';
import i18n from 'i18next';
import React, { PropTypes, Component } from 'react';
import FileBrowser from './FileBrowser.jsx';
import FileBrowserActions from '../../actions/FileBrowserActions';
import FileBrowserStore from '../../stores/FileBrowserStore';
import navGenerator from '../../generators/Navigable.jsx';
import KeyboardFocusActions from '../../actions/KeyboardFocusActions';
import KeyboardNameSpaceConstants from '../../constants/KeyboardNameSpaceConstants';
import ContextMenuActions from '../../actions/ContextMenuActions';
import OpenPlaylistActions from '../../actions/OpenPlaylistActions';
import { revealInFinder } from '../../util/helpers/openLink';

const FileBrowserOnSteroids = navGenerator(FileBrowser, KeyboardNameSpaceConstants.FILE_BROWSER,
  component => component.props.tree.map(({ id }) => id),
  component => find(component.props.tree, { id: component.state.selection[0] }),
  null,
  (component, buffer) => {
    const result = find(component.props.tree,
      x => x.name.toLowerCase().startsWith(buffer),
    ) || {};
    return result.id;
  },
);

const getContextMenuActions = function getContextMenuActions(item) {
  return [
    {
      label: i18n.t('sidebar.fileBrowser.contextMenu.reveal'),
      handler: () => revealInFinder(item.props.node.path),
    },
    {
      label: i18n.t('sidebar.fileBrowser.contextMenu.addToPlaylist', { folder: item.props.node.name }),
      handler: () => OpenPlaylistActions.addFolder(item.props.node.path),
    },
  ];
};

const handleArrowClick = function handleArrowClick(event, item) {
  if (item.props.collapsed) {
    FileBrowserActions.expandNodes([item.props.node]);
  } else {
    FileBrowserActions.collapseNodes([item.props.node]);
  }
};

const handleContextMenu = function handleContextMenu(event, item) {
  ContextMenuActions.show(
    getContextMenuActions(item),
    { top: event.clientY, left: event.clientX },
    event,
  );
};

const handleGlobalClick = function handleGlobalClick() {
  KeyboardFocusActions.requestFocus(KeyboardNameSpaceConstants.FILE_BROWSER);
};

const handleDelKeyPress = function handleDelKeyPress() {};
const handleEnterKeyPress = function handleEnterKeyPress() {};

class FileBrowserTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileTree: FileBrowserStore.getFileTree(),
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleScrollToElement = this.handleScrollToElement.bind(this);
    this.onFileBrowserChange = this.onFileBrowserChange.bind(this);
  }
  componentDidMount() {
    FileBrowserStore.addChangeListener(this.onFileBrowserChange);
  }
  componentWillUnmount() {
    FileBrowserStore.removeChangeListener(this.onFileBrowserChange);
  }
  onFileBrowserChange() {
    this.setState({
      fileTree: FileBrowserStore.getFileTree(),
    });
  }
  handleScrollToElement(state, list) {
    this.props.handleScrollToElement(state, list);
  }
  handleOpen(ids) {
    FileBrowserActions.expandNodes(
      this.state.fileTree.filter(node => contains(ids, node.id)),
    );
  }
  handleClose(ids) {
    FileBrowserActions.collapseNodes(
      this.state.fileTree.filter(node => contains(ids, node.id)),
    );
  }
  render() {
    return (
      <div onClick={handleGlobalClick}>
        <FileBrowserOnSteroids
          allowMultipleSelection
          handleDelKeyPress={handleDelKeyPress}
          handleEnterKeyPress={handleEnterKeyPress}
          handleScrollToElement={this.handleScrollToElement}
          handleArrowClick={handleArrowClick}
          handleContextMenu={handleContextMenu}
          handleOpen={this.handleOpen}
          handleClose={this.handleClose}
          isFocused={this.props.isFocused}
          tree={this.state.fileTree}
        />
      </div>
    );
  }
}

FileBrowserTab.propTypes = {
  handleScrollToElement: PropTypes.func,
  isFocused: PropTypes.bool,
};

export default FileBrowserTab;
