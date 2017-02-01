import { difference, without, uniq } from 'lodash';
import React, { Component as ReactComponent, PropTypes } from 'react';
import KeyboardFocusStore from '../stores/KeyboardFocusStore';
import KeyboardFocusActions from '../actions/KeyboardFocusActions';
import NavigableConstants from '../constants/NavigableConstants';

const _alphanumericRegex = new RegExp('^[a-zA-Z0-9\\s]+$');
const BUFFER_RESET_TIMEOUT = 500;
const SIMPLE_SELECTION_HANDLERS = 'up, down, alt+up, alt+down';
const MULTIPLE_SELECTION_HANDLERS = 'up, down, shift+up, shift+down, alt+up, alt+down, shift+alt+up, shift+alt+down';

const defaultGetSelectedIds = function defaultGetSelectedIds(component) {
  return component.state.selection;
};

const defaultSearchForBuffer = function defaultSearchForBuffer() {};

export default function navigable(
  Component,
  scopeName,
  getIdList,
  getSelectedElement,
  _getSelectedIds,
  _searchForBuffer,
) {
  const getSelectedIds = _getSelectedIds || defaultGetSelectedIds;
  const searchForBuffer = _searchForBuffer || defaultSearchForBuffer;

  class NavigableComponent extends ReactComponent {
    constructor(props) {
      super(props);
      this.state = {
        selection: this.props.initSelection || [],
        openElements: this.props.initOpenElements || [],
        direction: 0,
      };
      this._onKeyboardFocusChange = this._onKeyboardFocusChange.bind(this);
      this._clearBufferTimeout = this._clearBufferTimeout.bind(this);
      this._scheduleBufferReset = this._scheduleBufferReset.bind(this);
      this.getIdList = this.getIdList.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.handleEnterKeyPress = this.handleEnterKeyPress.bind(this);
      this.handleArrowKeyPress = this.handleArrowKeyPress.bind(this);
      this.handleLeftRightKeyPress = this.handleLeftRightKeyPress.bind(this);
      this.handleDelKeyPress = this.handleDelKeyPress.bind(this);
      this.handleSelectAllKeyPress = this.handleSelectAllKeyPress.bind(this);
      this.handleTextKeyPress = this.handleTextKeyPress.bind(this);
    }
    componentDidMount() {
      KeyboardFocusStore.addChangeListener(this._onKeyboardFocusChange);
      this._keyBuffer = '';
      this._resetBufferTimeout = null;
    }
    componentDidUpdate() {
      this.props.handleScrollToElement(this.state, this.getIdList(), this.component);
      if (this.props.isFocused) {
        this.onFocusRequest();
      }
    }
    componentWillUnmount() {
      KeyboardFocusStore.removeChangeListener(this._onKeyboardFocusChange);
      this._clearBufferTimeout();
    }
    onFocusRequest(params = {}) {
      if (params.id && params.direction) {
        const ids = this.getIdList();
        const currentIndex = ids.indexOf(params.id);
        if (currentIndex < ids.length - 1 && currentIndex > -1) {
          this.setState({
            selection: [ids[currentIndex + (params.direction === 'up' ? 0 : 1)]],
          });
        }
      }
      if (params.requestFocus) {
        KeyboardFocusActions.setFocus(this.getHandlers(), scopeName);
      }
    }
    getIdList() {
      return getIdList(this);
    }
    getSelectedElement() {
      return getSelectedElement(this);
    }
    getSelectedIds() {
      return getSelectedIds(this);
    }
    getHandlers() {
      const handlers = {
        'backspace, del': this.handleDelKeyPress,
        enter: this.handleEnterKeyPress,
        'command+a': this.handleSelectAllKeyPress,
        'left, right': this.handleLeftRightKeyPress,
        '*': this.handleTextKeyPress,
      };
      if (this.props.allowMultipleSelection) {
        handlers[MULTIPLE_SELECTION_HANDLERS] = this.handleArrowKeyPress;
      } else {
        handlers[SIMPLE_SELECTION_HANDLERS] = this.handleArrowKeyPress;
      }
      return handlers;
    }
    handleClick(event, item) {
      const ids = this.getIdList();
      const index = ids.indexOf(item.props.itemKey);
      const [low, hi] = [
        ids.indexOf(this.state.selection[0]),
        ids.indexOf(this.state.selection[this.state.selection.length - 1]),
      ];

      if (event.metaKey) {
        this.setState({
          selection: item.props.isSelected
            ? without(this.state.selection, item.props.itemKey)
            : this.state.selection.concat([item.props.itemKey]),
        });
      } else if (event.shiftKey && this.props.allowMultipleSelection) {
        this.setState({
          selection: ids.slice(
            Math.min(low, index), Math.max(hi, index) + 1,
          ),
        });
      } else {
        this.setState({
          selection: [item.props.itemKey],
          lastAction: NavigableConstants.MOUSE_INPUT,
        });
      }
    }
    handleEnterKeyPress(event) {
      this.props.handleEnterKeyPress(event, this);
    }
    handleArrowKeyPress(event) {
      const ids = this.getIdList();
      const [low, hi] = [
        ids.indexOf(this.state.selection[0]),
        ids.indexOf(this.state.selection[this.state.selection.length - 1]),
      ];
      let newLow = low;
      let newHi = hi;
      let direction = 0;
      switch (event.which) {
        case 38: // up
          direction = -1;
          if (event.shiftKey && event.altKey) {
            newLow = 0;
          } else if (event.shiftKey) {
            newLow = Math.max(0, low - 1);
          } else if (event.altKey) {
            newLow = newHi = 0;
          } else {
            newLow = Math.max(0, low - 1);
            newHi = newLow;
          }
          break;
        case 40: // down
          direction = 1;
          if (event.shiftKey && event.altKey) {
            newHi = ids.length - 1;
          } else if (event.shiftKey) {
            newHi = Math.min(ids.length - 1, hi + 1);
          } else if (event.altKey) {
            newLow = newHi = ids.length - 1;
          } else {
            newLow = Math.min(ids.length - 1, low + 1);
            newHi = newLow;
          }
          break;
        default:
          break;
      }
      this.setState({
        selection: ids.slice(newLow, newHi + 1),
        direction,
        lastAction: NavigableConstants.KEYBOARD_INPUT,
      });
    }
    handleLeftRightKeyPress(event) {
      switch (event.which) {
        case 39: // right
          this.openElements(this.state.selection);
          break;
        case 37: // left
          this.closeElements(this.state.selection);
          break;
        default:
          break;
      }
    }
    handleDelKeyPress(event) {
      this.props.handleDelKeyPress(event, this, this.getSelectedIds(this));
      this.setState({
        selection: [],
        lastAction: null,
      });
    }
    handleSelectAllKeyPress() {
      this.setState({
        selection: this.getIdList(),
        lastAction: NavigableConstants.KEYBOARD_INPUT,
      });
    }
    handleTextKeyPress(event) {
      const pressedKey = String.fromCharCode(event.which);
      if (!_alphanumericRegex.test(pressedKey)) {
        return;
      }
      this._clearBufferTimeout();
      this._keyBuffer += pressedKey.toLowerCase();
      this.gotoItemForBuffer(this._keyBuffer);
      this._scheduleBufferReset();
    }
    gotoItemForBuffer(buffer) {
      const result = this.searchForBuffer(buffer);
      if (result) {
        this.setState({
          selection: [result],
        });
      }
    }
    openElements(ids) {
      this.setState({
        openElements: uniq(this.state.openElements.concat(ids)),
        lastAction: NavigableConstants.KEYBOARD_INPUT,
      });
      if (this.props.handleOpen) {
        this.props.handleOpen(ids);
      }
    }
    closeElements(ids) {
      this.setState({
        openElements: difference(this.state.openElements, ids),
        lastAction: NavigableConstants.KEYBOARD_INPUT,
      });
      if (this.props.handleClose) {
        this.props.handleClose(ids);
      }
    }
    searchForBuffer(buffer) {
      return searchForBuffer(this, buffer);
    }
    _onKeyboardFocusChange() {
      const currentScopeName = KeyboardFocusStore.getCurrentScopeName();
      if (scopeName === currentScopeName) {
        this._keyBuffer = '';
        KeyboardFocusActions.setFocus(this.getHandlers(), scopeName);
      }
    }
    _clearBufferTimeout() {
      if (this._resetBufferTimeout) {
        clearTimeout(this._resetBufferTimeout);
      }
    }
    _scheduleBufferReset() {
      this._resetBufferTimeout = setTimeout(
        () => { this._keyBuffer = ''; },
        BUFFER_RESET_TIMEOUT,
      );
    }
    render() {
      return (
        <Component
          ref={(c) => { this.component = c; }}
          handleClick={this.handleClick}
          focusParent={this.onFocusRequest}
          closeElements={this.closeElements}
          {...this.props}
          {...this.state}
        />
      );
    }
  }

  NavigableComponent.propTypes = {
    handleDelKeyPress: PropTypes.func.isRequired,
    handleEnterKeyPress: PropTypes.func.isRequired,
    handleScrollToElement: PropTypes.func.isRequired,
    handleOpen: PropTypes.func,
    handleClose: PropTypes.func,
    isFocused: PropTypes.bool,
    allowMultipleSelection: PropTypes.bool,
    initOpenElements: PropTypes.arrayOf(PropTypes.string),
    initSelection: PropTypes.arrayOf(PropTypes.string),
  };
  return NavigableComponent;
}
