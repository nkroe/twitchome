import {combineReducers} from 'redux';

import clips from './Clips';
import streamers from './Streamers';
import period from './Period';
import limit from './Limit';

const rootReducer = combineReducers({
    clips,
    streamers,
    period,
    limit

});

export default rootReducer;