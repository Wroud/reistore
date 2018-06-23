const { combineReducers } = require("redux");
const modifyReducer = (initCounterStore) => (state = { ...initCounterStore }) => ({
    ...state,
    scope: {
        ...state.scope,
        counter: 1
    }
});
const counterReducer = (initCounterStore) => (state = { ...initCounterStore }, action) => {
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

const dcounterReducer = (state = 0, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
};

const deepCounterReducer = combineReducers({
    scope0: combineReducers({
        scope1: combineReducers({
            scope2: combineReducers({
                scope3: combineReducers({
                    scope4: combineReducers({
                        counter: dcounterReducer
                    }),
                    counter: dcounterReducer
                }),
                counter: dcounterReducer
            }),
            counter: dcounterReducer
        }),
        counter: dcounterReducer
    }),
    counter: dcounterReducer
});
// const deepCounterReducer = (initDeepCounterStore) => (state = { ...initDeepCounterStore }, action) => {
//     switch (action.type) {
//         case 'INCREMENT':
//             return {
//                 ...state,
//                 scope0: {
//                     ...state.scope0,
//                     scope1: {
//                         ...state.scope1,
//                         scope2: {
//                             ...state.scope2,
//                             scope3: {
//                                 ...state.scope3,
//                                 scope4: {
//                                     ...state.scope4,
//                                     counter: state.scope0.scope1.scope2.scope3.scope4.counter + 1
//                                 }
//                             }
//                         }
//                     }
//                 }
//             };
//         case 'DECREMENT':
//             return {
//                 ...state,
//                 scope0: {
//                     ...state.scope0,
//                     scope1: {
//                         ...state.scope1,
//                         scope2: {
//                             ...state.scope2,
//                             scope3: {
//                                 ...state.scope3,
//                                 scope4: {
//                                     ...state.scope4,
//                                     counter: state.scope0.scope1.scope2.scope3.scope4.counter - 1
//                                 }
//                             }
//                         }
//                     }
//                 }
//             };
//         default:
//             return state;
//     }
// };

const normalizedReducer = (initNormalizedState) => (state = { ...initNormalizedState }, action) => {
    switch (action.type) {
        case 'add':
            return {
                ...state,
                news: { ...state.news, [action.payload.id]: action.payload },
                show: [...state.show, action.payload.id]
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
module.exports.deepCounterReducer = deepCounterReducer;
module.exports.normalizedReducer = normalizedReducer;
module.exports.modifyReducer = modifyReducer;
module.exports.counterReducer = counterReducer;