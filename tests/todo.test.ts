import {TodoRecord} from "../records/todo.record";

const defaultObj = {
    title: 'moje zadanie',
    description: '',
    isClosed: false,
    ownerId: 'ererer'
}

test('Validate invalid empty title', () => {

    expect( () => new TodoRecord({
        ...defaultObj,
        title:null,
    })).toThrowError('Tytył zadania nie może być pusty.');
})

test('Can add new record', () => {

    const record = new TodoRecord(defaultObj);

    expect(record.title).toBe('moje zadanie');
    expect(record.ownerId).toBe('ererer');
})

test('Validate invalide title', () => {

    expect( () => { new TodoRecord({
        ...defaultObj,
        title: 'mfadsfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    })}).toThrowError('Tytył zadania nie może przekraczać 50 znaków.');

})

test('Validate invalide ownerId', () => {

    expect( () => { new TodoRecord({
        ...defaultObj,
        ownerId:null,
    })}).toThrowError('Właściciel zadania nie może być pusty.');

})