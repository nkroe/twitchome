import {createStore} from 'redux';
// import logger from 'redux-logger';
import rootReducers from './reducers/index';

const store = createStore(rootReducers);
// , applyMiddleware(logger)
export default store;