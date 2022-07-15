import {OwnerRecord} from "../records/owner.record";
import {pool} from "../utils/db";

afterAll( () => {
    pool.end();
})
test('OwnerRecord can insert data to database', async () =>{
    const record = new OwnerRecord({
        name:Date.now().toString(),
        fullName: 'Adam Nowak',
        password: 'password',
    })

    await record.insert();
    let recordFormDb1 = await OwnerRecord.getOne(record.id);

    expect(recordFormDb1).toBeDefined();

    await OwnerRecord.delete(record.id);

    let recordFormDb2 = await OwnerRecord.getOne(record.id);
    expect(recordFormDb2).toBeNull();

})