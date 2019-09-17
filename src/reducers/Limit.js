const initialState = {
    limit: 10
};

export default function (state = initialState, action){
    switch(action.type){
        case 'SET_LIMIT':
            return {
                limit: action.payload,
            }
        default:
            return state;
    }
}