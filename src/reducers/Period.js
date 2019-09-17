const initialState = {
    period: 'day'
};

export default function (state = initialState, action){
    switch(action.type){
        case 'SET_PERIOD':
            return {
                period: action.payload,
            }
        default:
            return state;
    }
}