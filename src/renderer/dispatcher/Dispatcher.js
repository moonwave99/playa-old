const Dispatcher = function Dispatcher() {};

Dispatcher.prototype = Object.assign({
  _callbacks: [],
  _promises: [],
}, Dispatcher.prototype, {
  register(callback) {
    this._callbacks.push(callback);
    return this._callbacks.length - 1; // index
  },
  dispatch(payload) {
    // First create array of promises for callbacks to reference.
    const resolves = [];
    const rejects = [];
    this._promises = this._callbacks.map((_, i) =>
      new Promise((resolve, reject) => {
        resolves[i] = resolve;
        rejects[i] = reject;
      }),
    );
    // Dispatch to callbacks and resolve/reject promises.
    this._callbacks.forEach((callback, i) =>
      // Callback can return an obj, to resolve, or a promise, to chain.
      // See waitFor() for why this might be useful.
      Promise.resolve(callback(payload)).then(
        () => resolves[i](payload),
        () => rejects[i](new Error('Dispatcher callback unsuccessful')),
      ),
    );
    this._promises = [];
  },
});

export default Dispatcher;
