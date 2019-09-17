const initialState = {
    clips: []
};

export default function (state = initialState, action){
    switch(action.type){
        case 'SET_CLIPS':
            return {
                clips: action.payload,
            }
        default:
            return state;
    }
}