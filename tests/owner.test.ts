import {OwnerRecord} from "../records/owner.record";

test('OwnerRecord can insert data to database', async () =>{
    const record = new OwnerRecord({
        name:'user name 1',
        password: 'password',
    })

    await record.insert();
    let recordFormDb1 = await OwnerRecord.getOne(record.id);

    expect(recordFormDb1).toBeDefined();

    await record.delete();

    let recordFormDb2 = await OwnerRecord.getOne(record.id);
    expect(recordFormDb2).toBeNull();

})