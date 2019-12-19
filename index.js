import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {call, put, takeEvery, all, select} from 'redux-saga/effects';
import {createStore, applyMiddleware, compose} from 'redux';
import createSagaMiddleware from 'redux-saga';

/**
 * The Store manager will handle automatic sagas so you don't
 * have to write much code for them.
 */
export class StoreManager {
  constructor(props={}) {
    const {onBefore = null, onAfter = null, devToolsEnabled = false} = props;
    this.devToolsEnabled = devToolsEnabled;
    this.onBefore = onBefore;
    this.onAfter = onAfter;
    this.asyncFunctions = {};
    this.sagas = {};
    this.watches = [];
    this._handleError = function* (errTarget) {
      if (typeof errTarget === 'string') {
        yield put({type: errTarget});
      } else if (typeof errTarget === 'object') {
        yield put({type: errTarget.type, payload: errTarget.data});
      }
    };
  }

  addAsyncFunc(funcConfig) {
    const {
      action,
      asyncFunc,
      validateCallback = (data) => ({valid: true, data: data}),
      selector = null,
      errCallback = null,
      validTarget = null,
      invalidTarget = null,
      errTarget = null,
    } = funcConfig;

    if (!Array.isArray(this.asyncFunctions[action])) {
      this.asyncFunctions[action] = [];
    }

    this.asyncFunctions[action].push({
      asyncFunc,
      validateCallback,
      selector,
      errCallback,
      validTarget,
      invalidTarget,
      errTarget,
    });
  }

  addSaga(action, saga) {
    this.sagas[action] = saga;
  }

  createStore(rootReducer, initialState, middlewares=[]) {
    Object.keys(this.asyncFunctions).forEach((key) => {
      this.sagas[key] = function* (action) {
        this.onBefore && this.onBefore(key);
        for (const handler of this.asyncFunctions[key]) {
          try {
            const result = handler.selector === null ?
              handler.validateCallback(yield call(handler.asyncFunc, action)) :
              handler.validateCallback(
                  yield call(handler.asyncFunc, yield select(handler.selector), action));
            if (result.valid) {
              if (typeof handler.validTarget === 'string' && handler.validTarget.length > 0) {
                yield put({type: handler.validTarget, payload: result.data});
              }
            } else {
              if (typeof handler.invalidTarget === 'string' && handler.invalidTarget.length > 0) {
                yield put({type: handler.invalidTarget, payload: result.data});
              }
            }
          } catch (error) {
            if (handler.errCallback) {
              yield call(handler.errCallback, error);
            }
            if (Array.isArray(handler.errTarget)) {
              for (const errTarget of handler.errTarget) {
                yield* this._handleError(errTarget);
              }
            } else if (handler.errTarget) {
              yield* this._handleError(handler.errTarget);
            }
          }
        }
        this.onAfter && this.onAfter(key);
      }.bind(this);
    });

    Object.keys(this.sagas).forEach((key) => {
      this.watches.push(function* () {
        yield takeEvery(key, this.sagas[key]);
      }.bind(this));
    });

    const watchSaga = function* () {
      const genFuncs = [];
      this.watches.forEach((func) => {
        genFuncs.push(func());
      });
      yield all(genFuncs);
    }.bind(this);

    const sagaMiddleware = createSagaMiddleware();
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && this.devToolsEnabled ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose :
      compose;

    const store = createStore(
        rootReducer,
        initialState,
        composeEnhancers(applyMiddleware(sagaMiddleware, ...middlewares)),
    );

    sagaMiddleware.run(watchSaga);
    return store;
  }
};

export default StoreManager;
