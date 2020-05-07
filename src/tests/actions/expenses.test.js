import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { startAddExpense, addExpense, editExpense, removeExpense} from '../../actions/expenses';
import {expenses} from '../fixtures/expenses';
import database from '../../firebase/firebase';

const createMockStore = configureMockStore([thunk]);



test('should setup remove expense action object', ()=>{
    const action = removeExpense({id: '123abc' });
    expect(action).toEqual({
        type: 'REMOVE_EXPENSE',
        id: '123abc'
    });
});

test('should setup edit expense action object', ()=>{
    const action = editExpense('123abc', {amount: 100} );
    expect(action).toEqual({
        type:'EDIT_EXPENSE',
        id: '123abc',
        updates: {amount:100}
    });
});

test('should setup add expense action object with provided values',()=>{

    const action = addExpense(expenses[2]);
    expect(action).toEqual({
        type:'ADD_EXPENSE',
        expense:expenses[2]
    });

});

test('should add expense to database and store', (done)=>{
    const store = createMockStore({});
    const expenseData = {
        description:'Playstation 5',
        amount:6000,
        note:'cool game console',
        createdAt:1000
    }
    // using redux-mock-store API
    store.dispatch(startAddExpense(expenseData)).then(()=>{
        // Gives us an array of all the actions dispatched to the store
        const actions = store.getActions();
        // In this case, we only expect there to be one ('ADD_EXPENSE')
        expect(actions[0]).toEqual({
            type:'ADD_EXPENSE',
            expense:{
                id:expect.any(String),
                ...expenseData
            }
        });

        // Original way, to avoid callback nesting, we return a promise below (see below)
        // // Check if data was stored in firebase
        // database.ref(`expenses/${actions[0].expense.id}`).once('value').then((snapshot)=>{
        //     expect(snapshot.val()).toEqual(expenseData);
        //     // Required for an async test in Jest
        //     done();
        // });

        // Returns a promise
        return database.ref(`expenses/${actions[0].expense.id}`).once('value');
    }).then((snapshot)=>{
            expect(snapshot.val()).toEqual(expenseData);
            // Required for an async test in Jest
            done();
    });
});

test('should add expense with defaults to database and store', ()=>{
    const store = createMockStore({});
    const expenseDefaults = {
        description:'',
        amount:0,
        note:'',
        createdAt:0
    }
    // using redux-mock-store API
    store.dispatch(startAddExpense({})).then(()=>{
        // Gives us an array of all the actions dispatched to the store
        const actions = store.getActions();
        // In this case, we only expect there to be one ('ADD_EXPENSE')
        expect(actions[0]).toEqual({
            type:'ADD_EXPENSE',
            expense:{
                id:expect.any(String),
                ...expenseDefaults
            }
        });

        // Returns a promise
        return database.ref(`expenses/${actions[0].expense.id}`).once('value');
    }).then((snapshot)=>{
            expect(snapshot.val()).toEqual(expenseDefaults);
            // Required for an async test in Jest
            done();
    });
});

// test('should setup add expense action object with default values',()=>{
//     const action = addExpense();
    
//     expect(action).toEqual({
//         type:'ADD_EXPENSE',
//         expense:{
//             id: expect.any(String),
//             description:'',
//             amount:0,
//             createdAt:0,
//             note:''
//         }
//     });
// });