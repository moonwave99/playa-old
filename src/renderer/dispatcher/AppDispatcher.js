import Dispatcher from './Dispatcher';

export default Object.assign({}, Dispatcher.prototype, {
  handleViewAction(action) {
    this.dispatch({
      source: 'VIEW_ACTION',
      action,
    });
  },
});
