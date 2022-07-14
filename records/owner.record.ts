import {OwnerEntity} from "../types";
import {v4 as uuid} from 'uuid';
import {ValidationError} from "../utils/errors";
import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";

interface NewOwnerEntity extends Omit<OwnerEntity, 'id'>{
    id?: string;
}
type OwnerRecordResult = [[OwnerEntity], [FieldPacket]];

export class OwnerRecord implements OwnerEntity{
    id: string;
    name: string;
    fullName: string;
    password: string;

    constructor(obj: NewOwnerEntity) {

        if (obj.name.length < 5 || obj.name.length > 50)
            throw new ValidationError('Długość nazwy użyktoniwka minimum 5 znaków i maksymalnie 50 znaków ')

        if (obj.name.length < 5 || obj.name.length > 75)
            throw new ValidationError('Długość fullName minimum 5 znaków i maksymalnie 75 znaków ')

        this.id = obj.id;
        this.name = obj.name;
        this.fullName = obj.fullName;
        this.password = obj.password;
    }

    async insert():Promise<string>{
        if(!this.id){
            this.id = uuid();
        }else
        {
            throw new ValidationError('Cannot insert something that is already inserted');
        }

        pool.execute("INSERT INTO `owners` (`id`, `name`, `fullName`, `password`) VALUE (:id, :name, :fullName, :password)", this);

        return this.id;
    }

    static async getOne(name: string) : Promise<OwnerEntity | null> {

        let [results] = await pool.execute("SELECT * FROM `owners` WHERE name = :name",{
            name,
        }) as OwnerRecordResult;

        return results.length > 0 ? new OwnerRecord(results[0]) : null;
    }
    static async getOneById(id: string) : Promise<OwnerEntity | null> {

        let [results] = await pool.execute("SELECT * FROM `owners` WHERE id = :id",{
            id,
        }) as OwnerRecordResult;

        return results.length > 0 ? new OwnerRecord(results[0]) : null;
    }
    static async delete(id: string): Promise<void> {
        pool.execute("DELETE FROM `owners` WHERE id = :id", {
            id,
        });
    }
}