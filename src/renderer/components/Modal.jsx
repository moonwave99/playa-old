import React, { Component, PropTypes } from 'react';
import cx from 'classnames';
import key from 'keymaster';
import ModalActions from '../actions/ModalActions';
import Rename from './modal/Rename.jsx';

const componentMap = { Rename };

const handleInnerClick = function handleInnerClick(event) {
  event.stopPropagation();
};

const handleBackgroundClick = function handleBackgroundClick() {
  ModalActions.hide();
};

const handleEscKeyPress = function handleEscKeyPress() {
  ModalActions.hide();
};

const bindKeyHandler = function bindKeyHandler() {
  key('esc', handleEscKeyPress);
};

const unbindKeyHandler = function unbindKeyHandler() {
  key.unbind('esc', handleEscKeyPress);
};

const getModalComponent = function getModalComponent(component) {
  return componentMap[component];
};

class Modal extends Component {
  constructor(props) {
    super(props);
    this.isKeyBound = false;
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isVisible === this.props.isVisible) {
      return;
    }
    if (!this.props.isVisible) {
      return;
    }
    this.modal.classList.add('in');
    if (this.props.isDismissable && !this.isKeyBound) {
      bindKeyHandler();
      this.isKeyBound = true;
    }
  }
  componentWillUnmount() {
    unbindKeyHandler();
    this.isKeyBound = false;
  }
  render() {
    const classes = cx({
      modal: true,
      isVisible: this.props.isVisible,
    });
    if (!this.props.params.component) {
      return null;
    }
    const InnerComponent = getModalComponent(this.props.params.component);
    return (
      <div
        className={classes}
        onClick={this.props.isDismissable ? handleBackgroundClick : null}
        ref={(c) => { this.modal = c; }}
      >
        <div
          className="modal-inner"
          onClick={this.props.isDismissable ? handleInnerClick : null}
        >
          <InnerComponent {...this.props.params} />
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  isVisible: PropTypes.bool,
  isDismissable: PropTypes.bool,
  params: PropTypes.shape({
    component: PropTypes.string,
  }),
};

export default Modal;
