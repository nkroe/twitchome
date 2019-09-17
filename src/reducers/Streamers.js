const initialState = {
    streamers: []
};

export default function (state = initialState, action){
    switch(action.type){
        case 'SET_STREAMERS':
            return {
                streamers: action.payload,
            };
        default:
            return state;
    }
}