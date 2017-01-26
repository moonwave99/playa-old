'use babel';

import React, { Component, PropTypes } from 'react';
import cx from 'classnames';
import ContextMenuActions from '../actions/ContextMenuActions';
import KeyboardFocusStore from '../stores/KeyboardFocusStore';
import KeyboardFocusActions from '../actions/KeyboardFocusActions';
import KeyboardNameSpaceConstants from '../constants/KeyboardNameSpaceConstants';

const handleEscKeyPress = function handleEscKeyPress() {
  ContextMenuActions.hide();
};
const handleAction = function handleAction(event, action) {
  event.stopPropagation();
  if (action.handler) {
    action.handler();
  }
  ContextMenuActions.hide();
};

class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAction: -1,
    };
    this.handleArrowKeyPress = this.handleArrowKeyPress.bind(this);
    this.handleEnterKeyPress = this.handleEnterKeyPress.bind(this);
    this._onKeyboardFocusChange = this._onKeyboardFocusChange.bind(this);
  }
  componentDidMount() {
    KeyboardFocusStore.addChangeListener(this._onKeyboardFocusChange);
  }
  componentWillReceiveProps() {
    this.setState({
      selectedAction: -1,
    });
  }
  componentWillUnmount() {
    KeyboardFocusStore.removeChangeListener(this._onKeyboardFocusChange);
  }
  getHandlers() {
    return {
      esc: handleEscKeyPress,
      enter: this.handleEnterKeyPress,
      'up, down': this.handleArrowKeyPress,
    };
  }
  handleEnterKeyPress(event) {
    const action = this.props.actions[this.state.selectedAction];
    if (action) {
      handleAction(event, action);
    }
  }
  handleArrowKeyPress(event) {
    switch (event.which) {
      case 38: // up
        this.setState({
          selectedAction: Math.max(0, this.state.selectedAction - 1),
        });
        break;
      case 40: // down
        this.setState({
          selectedAction: Math.min(this.props.actions.length - 1, this.state.selectedAction + 1),
        });
        break;
      default:
        break;
    }
  }
  _onKeyboardFocusChange() {
    const currentScopeName = KeyboardFocusStore.getCurrentScopeName();
    if (currentScopeName === KeyboardNameSpaceConstants.CONTEXT_MENU) {
      KeyboardFocusActions.setFocus(this.getHandlers(), KeyboardNameSpaceConstants.CONTEXT_MENU);
    }
  }
  render() {
    const classes = cx({
      'context-menu': true,
      'list-unstyled': true,
      visible: this.props.isVisible,
    });
    const style = {
      top: this.props.position.top,
      left: this.props.position.left,
    };
    return (
      <ul className={classes} style={style}>
        {this.props.actions.map((action, index) => {
          const actionClass = index === this.state.selectedAction ? 'selected' : null;
          return (
            <li key={action.label}>
              <button
                className={actionClass}
                onClick={event => handleAction(event, action)}
              >
                {action.label}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
}

ContextMenu.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.object).isRequired,
  position: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }).isRequired,
  isVisible: PropTypes.bool.isRequired,
};

module.exports = ContextMenu;
