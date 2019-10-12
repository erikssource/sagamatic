[![Build Status](https://travis-ci.org/erikssource/sagamatic.svg?branch=master)](https://travis-ci.org/erikssource/sagamatic) [![Coverage Status](https://coveralls.io/repos/github/erikssource/sagamatic/badge.svg?branch=master)](https://coveralls.io/github/erikssource/sagamatic?branch=master) ![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/erikssource/sagamatic)
# Sagamatic
A utility for reducing the boilerplate code needed for saga-redux

## Currently in Alpha Status
The testing code is not yet complete and neither is the documentation so Sagamatic is not yet
in a production state.

## Why Sagamatic?
Saga-redux is a great tool for performing asynchronous calls when dispatching redux actions. However, you can find yourself writing a lot of code that is very similar. There's a very common pattern of having a saga call a REST endpoint, and either dispatch another action for a success or another action for a failure. Sagamatic helps to reduce the code needed for some of these common patterns.

Let's look at simple example of using a saga.
```javascript
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { call, put, takeEvery, delay } from "redux-saga/effects";
import ReactDOM from "react-dom";

import reducer from "./reducer";
import { incrementValue, anyncIncrementValue, Actions } from "./actions";
import { fetchData } from "./api";

import "./styles.css";

function* fetchSaga() {
  const val = yield call(fetchData);
  yield put({ type: Actions.RECEIVE_VALUE, payload: val });
}

function* rootSaga() {
  yield takeEvery(Actions.ASYNC_INCREMENT_VALUE, fetchSaga);
}

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

function App() {
  const value = useSelector(state => state.value);
  const isFetching = useSelector(state => state.fetching);
  const dispatch = useDispatch();
  return (
    <div className="App">
      <h1>Simple Example Using Redux-Saga</h1>
      <p>
        <button onClick={() => dispatch(incrementValue())}>
          Increment the Counter
        </button>
      </p>
      <p>
        {isFetching && <span>Fetching...</span>}
        {!isFetching && (
          <button onClick={() => dispatch(anyncIncrementValue())}>
            Async Increment Counter
          </button>
        )}
      </p>
      <div>Counter: {value}</div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);
```

You can see the whole application at https://codesandbox.io/s/simple-saga-y5yu7

