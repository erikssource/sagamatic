[![Build Status](https://travis-ci.org/erikssource/sagamatic.svg?branch=master)](https://travis-ci.org/erikssource/sagamatic) [![Coverage Status](https://coveralls.io/repos/github/erikssource/sagamatic/badge.svg?branch=master)](https://coveralls.io/github/erikssource/sagamatic?branch=master) ![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/erikssource/sagamatic) ![npm bundle size](https://img.shields.io/bundlephobia/min/sagamatic)
# Sagamatic
A utility for reducing the boilerplate code needed for saga-redux

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

Let's look at the sagamatic implementation of the same thing:
```javascript
import React from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import StoreManager from "sagamatic";
import ReactDOM from "react-dom";
import reducer from "./reducer";
import { incrementValue, anyncIncrementValue, Actions } from "./actions";
import { fetchData } from "./api";

import "./styles.css";

const storeManager = new StoreManager();
storeManager.addAsyncFunc({
  action: Actions.ASYNC_INCREMENT_VALUE,
  asyncFunc: fetchData,
  validTarget: Actions.RECEIVE_VALUE
});
const store = storeManager.createStore(reducer);

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
You can see the whole application at https://codesandbox.io/s/simple-sagamatic-48jbt

In order to issue the api call fetchData() we need to implement a function and make sure it is included in the root saga. We also need to apply and run the saga middleware. This is code involved:
```javascript
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
```

With sagamatic the same functionality looks like the following.
```javascript
const storeManager = new StoreManager();
storeManager.addAsyncFunc({
  action: Actions.ASYNC_INCREMENT_VALUE,
  asyncFunc: fetchData,
  validTarget: Actions.RECEIVE_VALUE
});
const store = storeManager.createStore(reducer);
```

If you need to add more api calls. All you need to do is call StoreManager::addAsyncFunc with a configuration object. Of course, this is about the most simple example you can have, but more complex scenarios can be handled with the appropriate configuration. It is also possible to create your own sagas and attach them to the store manager which will take care of adding them to the root saga. 

## Sagamatic API
Sagamatic has a lot of flexibility which can be set when constructing the StoreManager, creating the Redux store, and when adding
asynchronous functions.

### StoreManager Constructor
The StoreManager constructor can take an optional properties object with additional configuration.
```javascript
const storeManager = new StoreManager(
  {
    onBefore :function,
    onAfter :function,
    devToolsEnabled :boolean,
  }
);
```
##### onBefore (optional, function)
This is an optional function that will be called at the start of a saga generated by Sagamatic.

##### onAfter (optional, function)
This is an optional function that will be called at the end of a saga generated by Sagamatic.

##### devToolsEnabled (optional, boolean)
If this is set to 'true' then Redux Dev Tools will be enabled so the Redux store can be viewed in a browsers with the Redux Dev Tools extension. If this is set to false, then the Redux Dev Tools will be disabled.

### StoreManager::addAsyncFunc
Use this method to add an automatically generated saga for the redux store.
```javascript
storeManager.addAsyncFunc(
  {
    action: string,
    asyncFunc: function,
    validateCallback: function,
    selector: function,
    errCallback: function,
    validTarget: string,
    invalidTarget: string,
    errTarget: string,
  }
);
````
##### action (string)
The Redux action type that will invoke the generated saga. You can associate multiple functions to a single action.

##### asyncFunc (string)
The function to be called by the automatically generated saga. The function doesn't actually need to be an asychronous function, the function can be a generater function, return a Promise, or just a normal result. If there is a result (as opposed to throwing an exception), then it will be passed along to any specified Redux action(s) as a 

##### validateCallback (optional, function)
This optional function is called with the return value of the function specified by 'asyncFunc'. It shouild return an object the keys 'valid' and 'data' where 'valid' is a boolean indicating if the value is valid or not and 'data' is the data that will be passed on to any specified Redux actions.

Example
```javascript
function(data) {
  if (isValid(data)) {
    return {valid: true, data: data};
  }
  else {
    return {valid: false, data: []};
  }
}
```

##### selector (optional, function)
This is an optional function that retrieves a value from the state to be passed as an argument into the function specified by 'asyncFunc'.

Example
```javascript
const apiCall = async function(apiEndpoint) {
  const response = await request(apiEndpoint);
  return response.data;
};

storeManager.addAsyncFunc(
  {
    action: 'SOME_ACTION',
    asynFunc: apiCall,
    selector: (state) => state.apiEndpoint,
    validTarget: 'RECEIVE_DATA'
  }
);
```

##### errCallback (optional, function)
A callback called when the function specified by 'asyncFunc' throws an exception. The thrown error is passed as the argument.

##### validTarget (optional, string)
The Redux action dispatched after the successful call of the function specified by 'asyncFunc'. The object passed to the reducer will have the data from the asyncFunc in the 'payload' property. This will be dispatched if an exception isn't thrown and the validator function determines the data is valid (if there is no validator function, then the resulting data is always condidered valid). 

##### invalidTarget (optional, string)
The Redux action dispatched after the successful call of the function specified by 'asyncFunc' results in data that is considered invalid by the validator function.. The object passed to the reducer will have the data from the asyncFunc in the 'payload' property. This will be dispatched if an exception isn't thrown and the validator function determines the data is invalid (if there is no validator function, then the resulting data is always condidered valid and this will never be dispatched). 

##### errTarget (optional, string)
The Redux action dispatched after the function specified by 'asyncFunc' throws an exception. The action will be dispatched even if an errCallback is defined.

### StoreManager::addSaga
Sometimes a saga needs more logic than sagamatic can provide. The 'addSaga' method allows a saga function to be added and integrated into the saga middleware configured by sagamatic.
```javascript
storeManager.addSaga( 
  action :string,
  saga :function*
);
```

Example
```javascript
const mySaga = function* () {
  val = yield call(getSomeValue);
  yield put({type: SOME_ACTION, payload: val});
};

storeManager.addSaga(MY_ACTION, mySaga);
```

##### action (string)
The first argument is the Redux action that will invoke this saga.

##### saga (function*)
The second argument is the generator function that defines the saga.

### StoreManager::createStore
Once all the calls to 'addAsyncFunc' and 'addSaga' are made, then this method can be called to create the Redux store. The first argument is the Redux root reducer and is required. The second arguemnt is the initial state of the Redux store and is optional. The file argument is an arrary of middlewares that should be included and is optional.

##### rootReducer (function)
The root reducer of the Redux store. The same thing used to create a Redux store with the Redux createStore function.

##### initialState (optional, object)
The initial state of the Redux store.

##### middlewares (optional, function[])
An array of Redux middleware to be included in the Redux store. Sagamatic will generate the Saga middleware so that should not be included here.
