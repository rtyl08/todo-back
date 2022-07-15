import {TodoRecord} from "../records/todo.record";
import {OwnerRecord} from "../records/owner.record";
import {pool} from "../utils/db";


const defaultObj = {
    title: "Nowe zadanie 1",
    description: "Zakupić części zamienne do kosiarki",
    isClosed: false,
    ownerId: "tstststtst",
}

afterAll( () => {
    pool.end();
})

test('TodoRecord returns data form database for one record by id', async () =>{

    const ownerRecord = new OwnerRecord({
        name: Date.now().toString(),
        fullName: "Testowy użytkownk",
        password: "12345",
    });
    await ownerRecord.insert();
    console.log(ownerRecord.id);
    const todoRecord = new TodoRecord({
        title: "Testowy temat",
        description: "testowy opis",
        ownerId: ownerRecord.id,
        isClosed: false,
    });
    await  todoRecord.insert();

    const todo = await TodoRecord.getOne(todoRecord.id);


    expect(todo).toBeDefined();
    expect(todo.id).toBe(todoRecord.id);

    await OwnerRecord.delete(ownerRecord.id);
})

test('TodoRecord returns null from database for unknown id', async () =>{

    const todo = await TodoRecord.getOne('dddddd');

    expect(todo).toBeNull();
})

test('TodoRecord can insert record to database', async () =>{
    const ownerRecord = new OwnerRecord({
        name: Date.now().toString(),
        fullName: "Testowy użytkownk",
        password: "12345",
    });
    await ownerRecord.insert();

    const record = new TodoRecord({...defaultObj, ownerId: ownerRecord.id});

    const id = await record.insert();

    const recordFromDB = await TodoRecord.getOne(id);

    expect(recordFromDB).toBeDefined();
    expect(recordFromDB.id).toBe(id);

    await OwnerRecord.delete(ownerRecord.id);
})

test('TodoRecord can delete record form database', async () =>{
    const ownerRecord = new OwnerRecord({
        name: Date.now().toString(),
        fullName: "Testowy użytkownk",
        password: "12345",
    });
    await ownerRecord.insert();

    const record = new TodoRecord({...defaultObj, ownerId: ownerRecord.id});

    const id = await record.insert();

    let recordFromDB = await TodoRecord.getOne(id);
    expect(recordFromDB).toBeDefined();

    await TodoRecord.delete(id);

    recordFromDB = await TodoRecord.getOne(id);
    expect(recordFromDB).toBeNull();

    await OwnerRecord.delete(ownerRecord.id);
})

test('TodoRecord can update title, description, isClosed in database', async () =>{

    const ownerRecord = new OwnerRecord({
        name: Date.now().toString(),
        fullName: "Testowy użytkownk",
        password: "12345",
    });
    await ownerRecord.insert();

    const record = new TodoRecord({...defaultObj, ownerId: ownerRecord.id});
    await record.insert();

    record.title = 'nowy tytuł';
    record.description = 'nowy opis zadania';
    record.isClosed = true;

    await record.update();

    const recordFormDb = await TodoRecord.getOne(record.id);

    expect(recordFormDb.title).toBe('nowy tytuł');
    expect(recordFormDb.description).toBe('nowy opis zadania');
    expect(recordFormDb.isClosed).toBe(1);

    await OwnerRecord.delete(ownerRecord.id);
})
