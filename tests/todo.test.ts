import {TodoRecord} from "../records/todo.record";


const defaultObj = {
    title: "Nowe zadanie 1",
    description: "Zakupić części zamienne do kosiarki",
    isClosed: false,
    ownerId: "tstststtst",
}
test('TodoRecord returns data form database for one record by id', async () =>{

    const todo = await TodoRecord.getOne('73d3f348-fa34-11ec-96ef-001c42c60b59');

    console.log(todo);

    expect(todo).toBeDefined();
    expect(todo.id).toBe('73d3f348-fa34-11ec-96ef-001c42c60b59');
})

test('TodoRecord returns null from database for unknown id', async () =>{

    const todo = await TodoRecord.getOne('dddddd');

    expect(todo).toBeNull();
})

test('TodoRecord can insert record to database', async () =>{
    const record = new TodoRecord(defaultObj);

    const id = await record.insert();

    const recordFromDB = await TodoRecord.getOne(id);

    expect(recordFromDB).toBeDefined();
    expect(recordFromDB.id).toBe(id);
})

test('TodoRecord can delete record form database', async () =>{
    const record = new TodoRecord(defaultObj);

    const id = await record.insert();

    let recordFromDB = await TodoRecord.getOne(id);
    expect(recordFromDB).toBeDefined();

    await record.delete();

    recordFromDB = await TodoRecord.getOne(id);
    expect(recordFromDB).toBeNull();
})

test('TodoRecord can update title, description, isClosed in database', async () =>{
    const record = new TodoRecord(defaultObj);
    await record.insert();

    record.title = 'nowy tytuł';
    record.description = 'nowy opis zadania';
    record.isClosed = true;

    await record.update();

    const recordFormDb = await TodoRecord.getOne(record.id);

    expect(recordFormDb.title).toBe('nowy tytuł');
    expect(recordFormDb.description).toBe('nowy opis zadania');
    expect(recordFormDb.isClosed).toBe(1);
})
