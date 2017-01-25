'use babel';

import Dispatcher from './Dispatcher';

module.exports = Object.assign({}, Dispatcher.prototype, {
  handleViewAction(action) {
    this.dispatch({
      source: 'VIEW_ACTION',
      action,
    });
  },
});
