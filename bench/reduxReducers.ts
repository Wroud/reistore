import { combineReducers } from "redux";
export const modifyReducer = (initCounterStore) => (state = { ...initCounterStore }) => ({
    ...state,
    scope: {
        ...state.scope,
        counter: 1
    }
});
export const counterReducer = (initCounterStore) => (state = { ...initCounterStore }, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return {
                ...state,
                scope: {
                    ...state.scope,
                    counter: state.scope.counter + 1
                }
            };
        case 'DECREMENT':
            return {
                ...state,
                scope: {
                    ...state.scope,
                    counter: state.scope.counter - 1
                }
            };
        default:
            return state;
    }
};

export const dcounterReducer = (state = 0, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
};

export const deepCounterReducer = combineReducers({
    scope0: combineReducers({
        scope1: combineReducers({
            scope2: combineReducers({
                scope3: combineReducers({
                    scope4: combineReducers({
                        counter: dcounterReducer
                    })
                })
            })
        })
    })
});

export const normalizedReducer = (initNormalizedState) => (state = { ...initNormalizedState }, action) => {
    switch (action.type) {
        case 'add':
            return {
                ...state,
                news: { ...state.news, [action.payload.id]: action.payload },
                show: [...state.show, action.payload.id]
            };
        case 'modify':
            return {
                ...state,
                news: {
                    ...state.news,
                    [action.payload.id]: {
                        ...state.news[action.payload.id],
                        text: action.payload.text
                    }
                }
            };
        case 'delete':
            const { [action.payload]: _, ...newNews } = state.news;
            return {
                ...state,
                news: newNews,
                show: state.show.filter(id => id !== action.payload)
            };
        default:
            return state;
    }
};