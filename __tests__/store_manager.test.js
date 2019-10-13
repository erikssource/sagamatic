import StoreManager from '..';
import {createStore} from 'redux';
import {call, put} from 'redux-saga/effects';

const FETCH_VALUE = 'FETCH_VALUE';
const FETCH_OTHER = 'FETCH_OTHER';
const RECEIVE_OTHER = 'RECEIVE_OTHER';
const RECEIVE_VALUE = 'RECEIVE_VALUE';
const FETCH_FAILED = 'FETCH_FAILED';
const FETCH_OTHER_FAILED = 'FETCH_OTHER_FAILED';
const ACTION_NOOP = 'ACTION_NOOP';

const VALUE_NONE = 'None';
const VALUE_ERROR = 'Error!';
const VALUE_OTHER = 'OtherValue';
const VALUE_GOOD = 'GoodValue';
const VALUE_BAD = 'BadValue';
const VALUE_EXTRA = 'ExtraValue';

const initialState = {
  value: VALUE_NONE,
  other: VALUE_NONE,
  lastAction: VALUE_NONE,
  extra: VALUE_EXTRA,
  actions: [],
};

const reducer = (state=initialState, action) => {
  const {type, payload} = action;
  switch (type) {
    case FETCH_VALUE:
      return {...state, lastAction: FETCH_VALUE, actions: [...state.actions, FETCH_VALUE]};
    case FETCH_OTHER:
      return {...state, lastAction: FETCH_OTHER, action: [...state.actions, FETCH_OTHER]};
    case RECEIVE_VALUE:
      return {...state, value: payload, lastAction: RECEIVE_VALUE, actions: [...state.actions, RECEIVE_VALUE]};
    case RECEIVE_OTHER:
      return {...state, other: payload, lastAction: RECEIVE_OTHER, actions: [...state.actions, RECEIVE_OTHER]};
    case FETCH_FAILED:
      return {...state, lastAction: FETCH_FAILED, actions: [...state.actions, FETCH_FAILED]};
    case FETCH_OTHER_FAILED:
      return {...state, lastAction: FETCH_OTHER_FAILED, actions: [...state.actions, FETCH_OTHER_FAILED]};
    case ACTION_NOOP:
      return {...state, lastAction: ACTION_NOOP, actions: [...state.actions, ACTION_NOOP]};
    default:
      return state;
  }
};

const fetchException = async function() {
  throw new Error(VALUE_ERROR);
};

const fetchGoodValue = async function() {
  return VALUE_GOOD;
};

const fetchOtherValue = async function() {
  return VALUE_OTHER;
};

const fetchBadValue = async function() {
  return VALUE_BAD;
};

const replaceValue = async function(value) {
  return value;
};

const fetchValidator = function(value) {
  return {valid: value === VALUE_GOOD, data: value};
};

const fullSaga = function* () {
  const val = yield call(fetchGoodValue);
  yield put({type: RECEIVE_VALUE, payload: val});
};

describe('Test test redux', () => {
  let store = null;

  beforeEach(() => {
    store = createStore(reducer);
  });

  test('Test initial redux state', () => {
    expect(store.getState().value).toEqual(VALUE_NONE);
    expect(store.getState().other).toEqual(VALUE_NONE);
    expect(store.getState().lastAction).toEqual(VALUE_NONE);
  });

  test('Test receive action', (done) => {
    store.subscribe(() => {
      expect(store.getState().value).toEqual(VALUE_GOOD);
      expect(store.getState().lastAction).toEqual(RECEIVE_VALUE);
      done();
    });
    store.dispatch({type: RECEIVE_VALUE, payload: VALUE_GOOD});
  });

  test('Test fetch failed', (done) => {
    store.subscribe(() => {
      expect(store.getState().value).toEqual(VALUE_NONE);
      expect(store.getState().lastAction).toEqual(FETCH_FAILED);
      done();
    });
    store.dispatch({type: FETCH_FAILED});
  });
});

describe('Simple Automatic Saga Success', () => {
  let storeManager = null;

  beforeEach(() => {
    storeManager = new StoreManager();
  });

  test('Single function with single target success', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchGoodValue,
      validTarget: RECEIVE_VALUE,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === RECEIVE_VALUE) {
        expect(store.getState().value).toEqual(VALUE_GOOD);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });

  test('Single function with single target failure', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchException,
      validTarget: RECEIVE_VALUE,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === ACTION_NOOP) {
        expect(store.getState().value).toEqual(VALUE_NONE);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
    setTimeout(() => store.dispatch({type: ACTION_NOOP}), 500);
  });
});

describe('Simple Automatic Saga With Error Target', () => {
  let storeManager = null;

  beforeEach(() => {
    storeManager = new StoreManager();
  });

  test('Single function with single target success', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchGoodValue,
      validTarget: RECEIVE_VALUE,
      errTarget: FETCH_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === RECEIVE_VALUE) {
        expect(store.getState().value).toEqual(VALUE_GOOD);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });

  test('Single function with single target exception', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchException,
      validTarget: RECEIVE_VALUE,
      errTarget: FETCH_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === FETCH_FAILED) {
        expect(store.getState().value).toEqual(VALUE_NONE);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });
});

describe('Simple Automatic Saga With Error Target', () => {
  let storeManager = null;

  beforeEach(() => {
    storeManager = new StoreManager();
  });

  test('Single function with single target success', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchGoodValue,
      validTarget: RECEIVE_VALUE,
      errTarget: FETCH_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === RECEIVE_VALUE) {
        expect(store.getState().value).toEqual(VALUE_GOOD);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });

  test('Single function with single target exception', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchException,
      validTarget: RECEIVE_VALUE,
      errTarget: FETCH_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === FETCH_FAILED) {
        expect(store.getState().value).toEqual(VALUE_NONE);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });
});

describe('Multiple Async Functions For Different Actions', () => {
  let storeManager = null;

  beforeEach(() => {
    storeManager = new StoreManager();
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchGoodValue,
      validTarget: RECEIVE_VALUE,
      errTarget: FETCH_FAILED,
    });
  });

  test('Two functions with single target success', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_OTHER,
      asyncFunc: fetchOtherValue,
      validTarget: RECEIVE_OTHER,
      errTarget: FETCH_OTHER_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === RECEIVE_OTHER) {
        expect(store.getState().value).toEqual(VALUE_NONE);
        expect(store.getState().other).toEqual(VALUE_OTHER);
        done();
      }
    });
    store.dispatch({type: FETCH_OTHER});
  });

  test('Two functions with single target failure', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_OTHER,
      asyncFunc: fetchException,
      validTarget: RECEIVE_OTHER,
      errTarget: FETCH_OTHER_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === FETCH_OTHER_FAILED) {
        expect(store.getState().value).toEqual(VALUE_NONE);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_OTHER});
  });
});

describe('Test validation function', () => {
  let storeManager = null;

  beforeEach(() => {
    storeManager = new StoreManager();
  });

  test('Test with validator and valid value', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchGoodValue,
      validateCallback: fetchValidator,
      validTarget: RECEIVE_VALUE,
      invalidTarget: FETCH_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === RECEIVE_VALUE) {
        expect(store.getState().value).toEqual(VALUE_GOOD);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });

  test('Test with validator and invalid value', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: fetchBadValue,
      validateCallback: fetchValidator,
      validTarget: RECEIVE_VALUE,
      invalidTarget: FETCH_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === FETCH_FAILED) {
        expect(store.getState().value).toEqual(VALUE_NONE);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });
});

describe('Test using selector', () => {
  let storeManager = null;

  beforeEach(() => {
    storeManager = new StoreManager();
  });

  test('Test using selector', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_VALUE,
      asyncFunc: replaceValue,
      selector: (state) => state.extra,
      validTarget: RECEIVE_VALUE,
      errTarget: FETCH_FAILED,
    });
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === RECEIVE_VALUE) {
        expect(store.getState().value).toEqual(VALUE_EXTRA);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });
});

describe('Test using saga', () => {
  let storeManager = null;

  beforeEach(() => {
    storeManager = new StoreManager();
  });

  test('Test using full saga', (done) => {
    storeManager.addAsyncFunc({
      action: FETCH_OTHER,
      asyncFunc: fetchOtherValue,
      validTarget: RECEIVE_OTHER,
      errTarget: FETCH_OTHER_FAILED,
    });
    storeManager.addSaga(FETCH_VALUE, fullSaga);
    const store = storeManager.createStore(reducer);
    store.subscribe(() => {
      if (store.getState().lastAction === RECEIVE_VALUE) {
        expect(store.getState().value).toEqual(VALUE_GOOD);
        expect(store.getState().other).toEqual(VALUE_NONE);
        done();
      }
    });
    store.dispatch({type: FETCH_VALUE});
  });
});
